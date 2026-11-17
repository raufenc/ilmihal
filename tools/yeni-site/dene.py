#!/usr/bin/env python3
"""ilmihal.org — başsız Chrome ile deneme aracı (ortak; herkes bunu kullanır).

KURALLAR bu aracın içinde uygulanır, dışarıda ayrıca tarayıcı AÇMAYIN:
  - Her zaman sessiz (--mute-audio).
  - Aynı anda en çok 3 başsız Chrome: /tmp altındaki kilitlerle sıraya girilir.
  - İş bitince tarayıcı kapanır.

Kullanım
  dene.py adim  <GxY> "<adımlar>" [--olcek 1] [--taban http://localhost:8260] [--telefon] [--webglsiz]
      adımlar ';;' ile ayrılır:
        url:/yol            sayfaya git (taban adrese eklenir; tam adres de olur)
        bekle:SN            saniye bekle
        sec:SEÇİCİ          seçici görünene dek bekle (10 sn)
        tikla:SEÇİCİ        tıkla
        yaz:SEÇİCİ=METİN    alana yaz
        tus:TUŞ             klavye tuşu (ArrowRight, Escape, Enter…)
        js:İFADE            sayfada çalıştır, sonucu yazdır
        cek:AD              ekran görüntüsü → tools/yeni-site/kare/AD.png
        tamcek:AD           tam sayfa ekran görüntüsü
        kaydir:Y            window.scrollTo(0, Y)
        cevrimdisi:1|0      ağı kes / aç
      Sonunda konsol hataları, sayfa hataları, başarısız istekler ve yatay taşma yazdırılır.
      Çıkış kodu: hata varsa 1.

  dene.py duman [--taban …] [--yollar dosya]
      tools/yeni-site/yollar.txt içindeki her yolu masaüstü ve telefon boyutunda açar;
      hata, başarısız istek, yatay taşma ve boş sayfa arar. Özet tablo basar. Çıkış kodu: hata varsa 1.
"""
import argparse, fcntl, json, os, sys, time

BURASI = os.path.dirname(os.path.abspath(__file__))
KARE = os.path.join(BURASI, "kare")
os.makedirs(KARE, exist_ok=True)
SLOT = 3


class Sira:
    """En çok SLOT tarayıcı: boş kilit dosyası bulunana dek bekler."""
    def __enter__(self):
        while True:
            for i in range(SLOT):
                f = open(f"/tmp/ilmihal-dene-{i}.kilit", "w")
                try:
                    fcntl.flock(f, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    self.f = f
                    return self
                except OSError:
                    f.close()
            time.sleep(1.5)

    def __exit__(self, *a):
        fcntl.flock(self.f, fcntl.LOCK_UN)
        self.f.close()


YOKSAY = ("/_vercel/",)          # Vercel'in kendi betikleri yalnız canlıda vardır


def tarayici(p, webglsiz=False):
    args = ["--mute-audio"]
    args += ["--disable-3d-apis"] if webglsiz else ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
    return p.chromium.launch(channel="chrome", headless=True, args=args)


def sayfa_ac(b, g, y, olcek=1, telefon=False):
    c = b.new_context(viewport={"width": g, "height": y}, device_scale_factor=olcek,
                      is_mobile=telefon, has_touch=telefon, locale="tr-TR", timezone_id="Europe/Istanbul")
    s = c.new_page()
    kayit = {"konsol": [], "hata": [], "istek": []}
    def konsol(m):
        if m.type in ("error", "warning") and not any(x in m.text for x in YOKSAY):
            yer = m.location.get("url", "") if m.location else ""
            if not any(x in yer for x in YOKSAY):
                kayit["konsol"].append(f"{m.type}: {m.text[:400]}")
    s.on("console", konsol)
    s.on("pageerror", lambda e: kayit["hata"].append(str(e)[:600]))
    s.on("requestfailed", lambda r: None if any(x in r.url for x in YOKSAY) else kayit["istek"].append(f"başarısız {r.url} ({r.failure})"))
    s.on("response", lambda r: kayit["istek"].append(f"{r.status} {r.url}") if r.status >= 400 and not any(x in r.url for x in YOKSAY) else None)
    return c, s, kayit


def tasma(s):
    return s.evaluate("document.documentElement.scrollWidth - window.innerWidth")


def adim_kos(a):
    from playwright.sync_api import sync_playwright
    g, y = (int(x) for x in a.boyut.lower().split("x"))
    kod = 0
    with Sira(), sync_playwright() as p:
        b = tarayici(p, a.webglsiz)
        try:
            c, s, kayit = sayfa_ac(b, g, y, a.olcek, a.telefon)
            for ham in a.adimlar.split(";;"):
                ham = ham.strip()
                if not ham:
                    continue
                tur, _, deger = ham.partition(":")
                try:
                    if tur == "url":
                        s.goto(deger if deger.startswith("http") else a.taban + deger, wait_until="domcontentloaded", timeout=30000)
                    elif tur == "bekle": time.sleep(float(deger))
                    elif tur == "sec": s.wait_for_selector(deger, timeout=10000)
                    elif tur == "tikla": s.click(deger, timeout=10000)
                    elif tur == "yaz":
                        sec, _, metin = deger.partition("=")
                        s.fill(sec, metin, timeout=10000)
                    elif tur == "tus": s.keyboard.press(deger)
                    elif tur == "js": print("js>", json.dumps(s.evaluate(deger), ensure_ascii=False)[:3000])
                    elif tur == "cek": s.screenshot(path=os.path.join(KARE, deger + ".png"))
                    elif tur == "tamcek": s.screenshot(path=os.path.join(KARE, deger + ".png"), full_page=True)
                    elif tur == "kaydir": s.evaluate(f"window.scrollTo(0, {int(deger)})")
                    elif tur == "cevrimdisi": c.set_offline(deger.strip() == "1")
                    else: print("? bilinmeyen adım:", ham)
                except Exception as e:
                    kod = 1
                    print(f"! ADIM BAŞARISIZ [{ham[:80]}]: {str(e)[:300]}")
            t = tasma(s)
            if t > 1:
                kod = 1
                print(f"! yatay taşma: {t}px")
            for tur in ("hata", "konsol", "istek"):
                for k in kayit[tur][:20]:
                    print(f"! {tur}: {k}")
                if kayit[tur] and tur != "konsol":
                    kod = 1
            if any(k.startswith("error") for k in kayit["konsol"]):
                kod = 1
            print("sonuç:", "HATA VAR" if kod else "temiz")
        finally:
            b.close()
    return kod


def duman_kos(a):
    from playwright.sync_api import sync_playwright
    yollar = [l.strip() for l in open(a.yollar, encoding="utf-8") if l.strip() and not l.startswith("#")]
    sorun = 0
    with Sira(), sync_playwright() as p:
        b = tarayici(p)
        try:
            for ad, g, y, tel in (("masaüstü", 1440, 900, False), ("telefon", 390, 844, True)):
                c, s, kayit = sayfa_ac(b, g, y, 1, tel)
                for yol in yollar:
                    for k in kayit.values(): k.clear()
                    t0 = time.time()
                    durum = "temiz"
                    try:
                        s.goto(a.taban + yol, wait_until="domcontentloaded", timeout=30000)
                        s.wait_for_function("document.body && document.body.dataset.hazir === '1'", timeout=15000)
                    except Exception as e:
                        durum = "HAZIR OLMADI"
                    time.sleep(0.4)
                    sure = time.time() - t0
                    notlar = []
                    try:
                        t = tasma(s)
                        if t > 1: notlar.append(f"taşma {t}px")
                        if s.evaluate("(document.querySelector('main')||document.body).innerText.trim().length") < 40: notlar.append("boş sayfa")
                    except Exception as e:
                        notlar.append("ölçülemedi")
                    notlar += kayit["hata"][:3] + [k for k in kayit["konsol"] if k.startswith("error")][:3] + kayit["istek"][:3]
                    if notlar or durum != "temiz":
                        sorun += 1
                        print(f"✗ {ad:9} {yol:38} {sure:4.1f}s  {durum if durum != 'temiz' else ''} {' | '.join(notlar)[:400]}")
                    else:
                        print(f"✓ {ad:9} {yol:38} {sure:4.1f}s")
                c.close()
        finally:
            b.close()
    print(f"\n{len(yollar) * 2} denemeden {sorun} sorunlu")
    return 1 if sorun else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    alt = ap.add_subparsers(dest="komut", required=True)
    ad = alt.add_parser("adim")
    ad.add_argument("boyut"); ad.add_argument("adimlar")
    ad.add_argument("--olcek", type=float, default=1); ad.add_argument("--taban", default="http://localhost:8260")
    ad.add_argument("--telefon", action="store_true"); ad.add_argument("--webglsiz", action="store_true")
    du = alt.add_parser("duman")
    du.add_argument("--taban", default="http://localhost:8260"); du.add_argument("--yollar", default=os.path.join(BURASI, "yollar.txt"))
    a = ap.parse_args()
    sys.exit(adim_kos(a) if a.komut == "adim" else duman_kos(a))
