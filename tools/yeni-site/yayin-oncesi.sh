#!/bin/bash
# Yayından önce TEK betik:  bash tools/yeni-site/yayin-oncesi.sh
# Sırayla: üretim (veri, arama dizini, site haritası, RSS, sürüm) → sınamalar → duman sınaması.
# Bir adım düşerse durur (çıkış kodu ≠ 0). Belge: tools/yeni-site/ALTYAPI.md
set -euo pipefail

KOK="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$KOK"
[ -d /Users/raufenc/pinokio/bin/miniconda/bin ] && export PATH="/Users/raufenc/pinokio/bin/miniconda/bin:$PATH"
PY=/usr/local/bin/python3; [ -x "$PY" ] || PY=python3
TABAN="${TABAN:-http://localhost:8260}"

adim() { local ad="$1"; shift; printf '\n── %s\n' "$ad"; "$@"; }
dizin_karmasi() { find "$1" -type f ! -name '* 2*' ! -name '.DS_Store' -print0 | sort -z | xargs -0 shasum -a 256 | shasum -a 256 | cut -c1-12; }

VERI_ONCE="$(cat veri/surum.json 2>/dev/null || echo yok)"
ARAMA_ONCE="$(dizin_karmasi veri-arama 2>/dev/null || echo yok)"

# 1. Üretim (hepsi deterministik)
adim "Veri (veri-uret)"             node tools/yeni-site/veri-uret.mjs
adim "Arama dizini (arama-uret)"    node tools/yeni-site/arama-uret.mjs
adim "Site haritası (sitemap-uret)" node tools/yeni-site/sitemap-uret.mjs
adim "RSS (rss-uret --sina)"        env TZ=Europe/Istanbul node tools/yeni-site/rss-uret.mjs --sina
adim "Sürüm (surum-uret)"           node tools/yeni-site/surum-uret.mjs

VERI_SONRA="$(cat veri/surum.json)"
ARAMA_SONRA="$(dizin_karmasi veri-arama)"
printf '\n── Üretim değişikliği\n'
[ "$VERI_ONCE" = "$VERI_SONRA" ] && echo "veri/: değişmedi ($VERI_SONRA)" || echo "veri/: DEĞİŞTİ  $VERI_ONCE → $VERI_SONRA"
[ "$ARAMA_ONCE" = "$ARAMA_SONRA" ] && echo "veri-arama/: değişmedi ($ARAMA_SONRA)" || echo "veri-arama/: DEĞİŞTİ  $ARAMA_ONCE → $ARAMA_SONRA"

# 2. Yapılandırma dosyaları geçerli JSON mu, sw.js ve kayıt sözdizimi
adim "Yapılandırma" "$PY" -c 'import json,sys; [json.load(open(f, encoding="utf-8")) for f in ("vercel.json","manifest.json")]; print("vercel.json, manifest.json geçerli")'
sozdizimi() {
  # ES modülleri .mjs kopyasıyla denetlenir (node, .js uzantılı bozuk bir modülü --check ile yakalamıyor)
  local g; g="$(mktemp -d)"
  node --check sw.js
  cp js/cekirdek/sw-kayit.js "$g/sw-kayit.mjs"; node --check "$g/sw-kayit.mjs"
  cp api/rss.js "$g/rss.mjs"; node --check "$g/rss.mjs"
  rm -rf "$g"; echo "sw.js, js/cekirdek/sw-kayit.js, api/rss.js ayrıştı"
}
adim "Sözdizimi" sozdizimi

# 3. Sınamalar
adim "Veri sınaması"        node tools/yeni-site/veri-sina.mjs
adim "Kullanıcı sınaması"   env TZ=Europe/Istanbul node tools/yeni-site/kullanici-sina.mjs
adim "Arama sınaması"       node tools/yeni-site/arama-sina.mjs
adim "Nemâz vakti sınaması" node tools/yeni-site/namaz-hesap.test.mjs --tarayicisiz

# 4. Duman sınaması (yerel sunucu kapalıysa bu iş için açılır, sonra kapatılır)
SUNUCU_PID=""
if ! curl -s -o /dev/null --max-time 3 "$TABAN/"; then
  "$PY" tools/yeni-site/sunucu.py 8260 >/dev/null 2>&1 &
  SUNUCU_PID=$!
  trap '[ -n "$SUNUCU_PID" ] && kill "$SUNUCU_PID" 2>/dev/null' EXIT
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null --max-time 1 "$TABAN/" && break; sleep 0.5; done
fi
adim "Duman sınaması (dene.py duman)" "$PY" tools/yeni-site/dene.py duman --taban "$TABAN"

printf '\nYayına hazır. Sürüm: %s\n' "$(sed -n "s/^const SURUM = '\(.*\)';$/\1/p" sw.js)"
