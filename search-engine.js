// ===== Birleşik Arama Motoru =====
// Inverted index + fuzzy matching + unified search API
// normalizeSearch(), wordVariants(), indexOfWordStart() fonksiyonları app.js'den kullanılır

(function() {
  'use strict';

  // --- Inverted Index ---
  // token → [{type, id, title, field, boost}]
  const index = new Map();
  let indexReady = false;
  const pendingCallbacks = [];

  // Aynı normalize fonksiyonu (app.js yüklenmeden önce de çalışsın diye kopyası)
  function norm(text) {
    if (!text) return '';
    return text
      .replace(/[âÂ]/g, 'a').replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g').replace(/ı/g, 'i').replace(/I/g, 'i').replace(/İ/g, 'i')
      .replace(/[îÎ]/g, 'i').replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u').replace(/[ûÛ]/g, 'u').replace(/[êÊ]/g, 'e')
      .replace(/[''\u2018\u2019-]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Tokenize: metni kelimelere ayır
  // Tek karakterli tokenları komşusuyla birleştir (a'zam → azam zaten norm ile çözülüyor)
  function tokenize(text) {
    const n = norm(text);
    if (!n) return [];
    return n.split(/\s+/).filter(w => w.length >= 2);
  }

  // Index'e doküman ekle
  function addToIndex(tokens, entry) {
    const seen = new Set();
    tokens.forEach(token => {
      if (seen.has(token)) return;
      seen.add(token);
      if (!index.has(token)) index.set(token, []);
      index.get(token).push(entry);
    });
  }

  // --- Index'i kur ---
  function buildIndex() {
    // 1. Maddeler (başlıklar)
    if (window.tocData) {
      window.tocData.forEach(m => {
        const tokens = tokenize(m.baslik);
        addToIndex(tokens, {
          type: 'madde',
          id: m.kisim + '/' + m.madde_no,
          title: m.baslik,
          subtitle: 'K\u0131s\u0131m ' + m.kisim + ', Madde ' + m.madde_no,
          field: 'title',
          boost: 10,
          data: m
        });
      });
    }

    // 2. Sözlük terimleri
    if (window.tanimlarData) {
      window.tanimlarData.forEach((t, i) => {
        // Terim adı (yüksek boost)
        const termTokens = tokenize(t.t);
        addToIndex(termTokens, {
          type: 'sozluk',
          id: 'sozluk-' + i,
          title: t.t,
          subtitle: t.c.length > 80 ? t.c.substring(0, 80) + '...' : t.c,
          field: 'term',
          boost: 8,
          data: t
        });
        // Anlam içeriği (düşük boost)
        const defTokens = tokenize(t.c);
        addToIndex(defTokens, {
          type: 'sozluk',
          id: 'sozluk-' + i,
          title: t.t,
          subtitle: t.c.length > 80 ? t.c.substring(0, 80) + '...' : t.c,
          field: 'definition',
          boost: 2,
          data: t
        });
      });
    }

    // 3. Şahıslar
    if (window.sahislarData) {
      window.sahislarData.forEach(s => {
        const tokens = tokenize(s.isim + ' ' + (s.unvan || ''));
        addToIndex(tokens, {
          type: 'sahis',
          id: 'sahis-' + s.slug,
          title: s.isim,
          subtitle: s.unvan || s.kategori || '',
          field: 'name',
          boost: 8,
          data: s
        });
      });
    }

    // 4. Tablolar
    if (window.tablolarData) {
      window.tablolarData.forEach(t => {
        if (t.baslik) {
          const tokens = tokenize(t.baslik);
          addToIndex(tokens, {
            type: 'tablo',
            id: 'tablo-' + t.id,
            title: t.baslik,
            subtitle: t.kaynak_text || '',
            field: 'title',
            boost: 6,
            data: t
          });
        }
      });
    }

    indexReady = true;
    pendingCallbacks.forEach(cb => cb());
    pendingCallbacks.length = 0;
  }

  // --- Levenshtein Distance (fuzzy matching için) ---
  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    // Kısa devre: çok farklı uzunluklar
    if (Math.abs(a.length - b.length) > 2) return 3;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
        // Erken çıkış
        if (i === j && matrix[i][j] > 2) return 3;
      }
    }
    return matrix[b.length][a.length];
  }

  // Index'teki token'lardan fuzzy eşleşme bul
  function fuzzyFind(query, maxDist) {
    maxDist = maxDist || 2;
    const results = new Map(); // token → distance

    // Önce exact match
    if (index.has(query)) {
      results.set(query, 0);
    }

    // Prefix match (3+ karakter sorgu için)
    if (query.length >= 3) {
      for (const token of index.keys()) {
        if (token.startsWith(query) && !results.has(token)) {
          results.set(token, 0.5); // prefix match, exact'ten biraz düşük
        }
      }
    }

    // Fuzzy match (4+ karakter sorgu için, performans için)
    if (query.length >= 4) {
      for (const token of index.keys()) {
        if (results.has(token)) continue;
        // Hızlı filtre: uzunluk farkı > maxDist ise atla
        if (Math.abs(token.length - query.length) > maxDist) continue;
        // İlk harf farklıysa genelde alakasız
        if (token[0] !== query[0]) continue;
        const dist = levenshtein(query, token);
        if (dist <= maxDist) {
          results.set(token, dist);
        }
      }
    }

    return results;
  }

  // --- Ana Arama Fonksiyonu ---
  // unifiedSearch(query, options) → { madde: [], sozluk: [], sahis: [], tablo: [], total: N }
  function unifiedSearch(query, options) {
    options = options || {};
    const limit = options.limit || 5; // her kategori için max sonuç

    if (!query || query.trim().length < 2) {
      return { madde: [], sozluk: [], sahis: [], tablo: [], total: 0 };
    }

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return { madde: [], sozluk: [], sahis: [], tablo: [], total: 0 };
    }

    // Varyant genişletme (app.js'deki wordVariants varsa kullan)
    const allQueryTokens = []; // [{token, distance}]
    queryTokens.forEach(qt => {
      // Exact + variants from app.js
      const variants = (typeof wordVariants === 'function') ? wordVariants(qt) : [qt];
      variants.forEach(v => {
        allQueryTokens.push({ original: qt, token: v, distance: 0 });
      });

      // Fuzzy matches
      const fuzzyMatches = fuzzyFind(qt, qt.length <= 4 ? 1 : 2);
      fuzzyMatches.forEach((dist, fToken) => {
        if (!variants.includes(fToken)) {
          allQueryTokens.push({ original: qt, token: fToken, distance: dist });
        }
      });
    });

    // Sonuç toplama: her sonuç ID'si için skor hesapla
    const scoreMap = new Map(); // id → { entry, score, matchedTokens }

    // Her sorgu kelimesi için
    queryTokens.forEach((qt, qi) => {
      // Bu kelime için tüm eşleşen token'ları bul
      const relevantTokens = allQueryTokens.filter(t => t.original === qt);

      relevantTokens.forEach(({ token, distance }) => {
        const entries = index.get(token);
        if (!entries) return;

        entries.forEach(entry => {
          const key = entry.type + ':' + entry.id;
          if (!scoreMap.has(key)) {
            scoreMap.set(key, { entry, score: 0, matchedWords: new Set() });
          }
          const record = scoreMap.get(key);
          const distPenalty = distance === 0 ? 1 : (distance <= 0.5 ? 0.9 : 0.5 / distance);
          record.score += entry.boost * distPenalty;
          record.matchedWords.add(qi);
        });
      });
    });

    // AND mantığı: tüm sorgu kelimeleri eşleşmeli (en az 1 token'la)
    // Tek kelime sorgularda bu otomatik sağlanır
    const minWords = queryTokens.length >= 3 ? queryTokens.length - 1 : queryTokens.length;

    const allResults = [];
    scoreMap.forEach(({ entry, score, matchedWords }) => {
      if (matchedWords.size >= minWords) {
        // Tüm kelimeler eşleşirse bonus
        const allMatch = matchedWords.size === queryTokens.length;
        allResults.push({
          ...entry,
          score: score * (allMatch ? 1.5 : 1)
        });
      }
    });

    // Skorla sırala
    allResults.sort((a, b) => b.score - a.score);

    // Kategorilere ayır + deduplicate
    const categories = { madde: [], sozluk: [], sahis: [], tablo: [] };
    const seen = {};
    Object.keys(categories).forEach(k => seen[k] = new Set());

    allResults.forEach(r => {
      if (seen[r.type].has(r.id)) return;
      if (categories[r.type].length >= limit) return;
      seen[r.type].add(r.id);
      categories[r.type].push(r);
    });

    const total = categories.madde.length + categories.sozluk.length +
                  categories.sahis.length + categories.tablo.length;

    return { ...categories, total };
  }

  // --- Tam metin arama (maddeler içinde, mevcut doFullSearch'ü tamamlar) ---
  async function unifiedFullSearch(query, limit) {
    limit = limit || 50;
    if (!query || query.trim().length < 2) return [];

    // Index sonuçlarını al
    const indexResults = unifiedSearch(query, { limit: limit });

    // Tam metin araması için kisimTexts'i yükle (app.js'den)
    if (typeof loadKisimTexts === 'function') {
      await Promise.all([loadKisimTexts(1), loadKisimTexts(2), loadKisimTexts(3)]);
    }

    // Metin içi arama (mevcut doFullSearch mantığıyla aynı)
    const queryExpanded = (typeof expandSearchQuery === 'function')
      ? expandSearchQuery(query)
      : { words: tokenize(query), wordVarLists: [tokenize(query)] };

    const textMatches = [];
    if (window.tocData && window.kisimTextsCache) {
      window.tocData.forEach(m => {
        const fullText = window.kisimTextsCache[m.kisim]?.[String(m.madde_no)] || '';
        const normText = norm(fullText);
        const normBaslik = norm(m.baslik || '');

        let allFound = true;
        let firstIdx = -1;
        let firstVar = null;

        for (let wi = 0; wi < queryExpanded.wordVarLists.length; wi++) {
          const wvars = queryExpanded.wordVarLists[wi];
          let found = false;
          for (const v of wvars) {
            const idx = normText.indexOf(v);
            if (idx !== -1) {
              found = true;
              if (firstIdx === -1) { firstIdx = idx; firstVar = v; }
              break;
            }
          }
          if (!found) {
            found = wvars.some(v => normBaslik.includes(v));
          }
          if (!found) { allFound = false; break; }
        }

        if (allFound) {
          let context = '';
          if (firstIdx !== -1) {
            const tLen = firstVar ? firstVar.length : 4;
            const start = Math.max(0, firstIdx - 60);
            const end = Math.min(fullText.length, firstIdx + tLen + 60);
            context = (start > 0 ? '...' : '') +
              fullText.substring(start, end) +
              (end < fullText.length ? '...' : '');
          }
          textMatches.push({
            type: 'madde',
            id: m.kisim + '/' + m.madde_no,
            title: m.baslik,
            subtitle: 'K\u0131s\u0131m ' + m.kisim + ', Madde ' + m.madde_no,
            context: context,
            inTitle: queryExpanded.wordVarLists.every(wvars =>
              wvars.some(v => normBaslik.includes(v))),
            data: m
          });
        }
      });
    }

    // Başlık eşleşmelerini öne al
    textMatches.sort((a, b) => (b.inTitle ? 1 : 0) - (a.inTitle ? 1 : 0));

    return {
      madde: textMatches.slice(0, limit),
      sozluk: indexResults.sozluk,
      sahis: indexResults.sahis,
      tablo: indexResults.tablo
    };
  }

  // --- AI Arama (Vercel Edge Function üzerinden gpt-4o-mini) ---
  const AI_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api/ilmihal-search/'  // local dev (Vercel CLI)
    : 'https://raufenc.com/api/ilmihal-search/';

  const SORU_KELIMELERI = ['nasıl', 'nedir', 'neler', 'nelerdir', 'kimler', 'kimdir', 'ne zaman',
    'ne kadar', 'hangi', 'kaç', 'niçin', 'neden', 'ne demek', 'ne demektir', 'farz mı',
    'haram mı', 'caiz mi', 'lazım mı', 'gerekir mi', 'olur mu', 'bozar mı', 'bozulur mu',
    'yapılır', 'alınır', 'kılınır', 'tutulur', 'verilir', 'okunur', 'edilir'];

  function isQuestion(query) {
    if (!query) return false;
    const q = query.toLowerCase().trim();
    if (q.includes('?')) return true;
    const words = q.split(/\s+/);
    if (words.length >= 3) {
      return SORU_KELIMELERI.some(sk => q.includes(sk));
    }
    return false;
  }

  let aiAbortController = null;

  async function aiSearch(query) {
    if (aiAbortController) aiAbortController.abort();
    aiAbortController = new AbortController();

    try {
      const resp = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: aiAbortController.signal
      });

      if (!resp.ok) throw new Error('API error: ' + resp.status);

      const data = await resp.json();
      if (!data.results || !Array.isArray(data.results)) return [];

      // Dönen madde ID'lerini tocData'dan zenginleştir
      return data.results.map(r => {
        const madde = window.tocData?.find(m => m.kisim === r.k && m.madde_no === r.m);
        if (!madde) return null;
        return {
          type: 'madde',
          id: r.k + '/' + r.m,
          title: madde.baslik,
          subtitle: r.s || ('Kısım ' + r.k + ', Madde ' + r.m),
          data: madde,
          aiMatch: true
        };
      }).filter(Boolean);
    } catch (err) {
      if (err.name === 'AbortError') return null; // iptal edildi
      console.warn('AI search error:', err);
      return []; // fallback'e düşecek
    }
  }

  // --- Public API ---
  window.SearchEngine = {
    search: unifiedSearch,
    fullSearch: unifiedFullSearch,
    aiSearch: aiSearch,
    isQuestion: isQuestion,
    isReady: function() { return indexReady; },
    onReady: function(cb) {
      if (indexReady) cb();
      else pendingCallbacks.push(cb);
    },
    rebuild: buildIndex
  };

  // Sayfa yüklenince index'i kur (veri dosyaları yüklendikten sonra)
  function tryBuild() {
    if (window.tocData) {
      // Küçük gecikme ile kur (tüm script'ler yüklensin)
      setTimeout(buildIndex, 100);
    } else {
      setTimeout(tryBuild, 200);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryBuild);
  } else {
    tryBuild();
  }
})();
