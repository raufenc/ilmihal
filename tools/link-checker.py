#!/usr/bin/env python3
"""ilmihal.org iç link kontrolü - QA-01"""
import re, sys, os, json
from pathlib import Path

ROOT = Path(__file__).parent.parent

def check_html_links():
    """index.html içindeki tüm iç linkleri kontrol et."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    errors = []

    # href="dosya.js" veya src="dosya.js" gibi yerel referansları bul
    refs = re.findall(r'(?:href|src)=["\']([^"\'#]+?)["\']', html)
    # SPA rotaları (Vercel rewrite ile index.html'e yönlenir)
    spa_routes = {
        "/anasayfa", "/icerik", "/fevaid", "/sozluk", "/arama", "/sahislar",
        "/hakkinda", "/quiz", "/ayet-hadis", "/okuma-plani", "/gunun-bilgisi",
        "/rehberler", "/fikih-karsilastirma", "/calisma-alanim"
    }
    for ref in refs:
        if ref.startswith("http") or ref.startswith("//") or ref.startswith("data:"):
            continue
        if ref in spa_routes:
            continue
        path = ref.split("?")[0]
        full = ROOT / path.lstrip("/")
        if not full.exists():
            errors.append(f"Eksik dosya: {ref}")

    return errors

def check_sitemap():
    """sitemap.xml'deki rotaları kontrol et."""
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    locs = re.findall(r"<loc>(.*?)</loc>", sitemap)

    valid_pages = [
        "anasayfa", "icerik", "fevaid", "sozluk", "arama", "sahislar",
        "hakkinda", "quiz", "ayet-hadis", "okuma-plani", "gunun-bilgisi",
        "rehberler", "fikih-karsilastirma", "calisma-alanim"
    ]

    errors = []
    for loc in locs:
        path = loc.replace("https://ilmihal.org/", "").replace("https://www.ilmihal.org/", "").strip("/")
        if not path:
            continue
        # madde/X/Y rotası
        if path.startswith("madde/"):
            parts = path.split("/")
            if len(parts) != 3:
                errors.append(f"Geçersiz madde rotası: {path}")
            continue
        # silsile-atlasi ayrı dizin
        if path.startswith("silsile-atlasi"):
            if not (ROOT / "silsile-atlasi" / "index.html").exists():
                errors.append(f"Silsile atlası index.html eksik")
            continue
        # Sayfa rotası
        if path not in valid_pages:
            errors.append(f"Bilinmeyen rota: {path}")

    return errors

def check_js_refs():
    """JS dosyalarındaki script referanslarını kontrol et."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    scripts = re.findall(r'<script src="([^"]+)"', html)
    errors = []
    for s in scripts:
        path = s.split("?")[0]
        if not (ROOT / path).exists():
            errors.append(f"Eksik JS dosyası: {s}")
    return errors

def main():
    print("=== ilmihal.org Link Checker ===\n")

    all_errors = []

    print("1. HTML iç linkler kontrol ediliyor...")
    errs = check_html_links()
    all_errors.extend(errs)
    for e in errs:
        print(f"   ❌ {e}")
    if not errs:
        print("   ✅ Tüm linkler geçerli")

    print("\n2. Sitemap rotaları kontrol ediliyor...")
    errs = check_sitemap()
    all_errors.extend(errs)
    for e in errs:
        print(f"   ❌ {e}")
    if not errs:
        print("   ✅ Tüm rotalar geçerli")

    print("\n3. JS dosya referansları kontrol ediliyor...")
    errs = check_js_refs()
    all_errors.extend(errs)
    for e in errs:
        print(f"   ❌ {e}")
    if not errs:
        print("   ✅ Tüm JS dosyaları mevcut")

    print(f"\n{'='*40}")
    if all_errors:
        print(f"❌ {len(all_errors)} hata bulundu!")
        return 1
    else:
        print("✅ Tüm kontroller başarılı!")
        return 0

if __name__ == "__main__":
    sys.exit(main())
