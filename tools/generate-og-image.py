#!/usr/bin/env python3
"""
ilmihal.org için Open Graph paylaşım görseli üretir.
Çıktı: og-image.png (1200x630)

Sitenin kendi yazı tiplerini (fonts/ altındaki Literata ve Inter woff2
alt kümeleri) kullanır; böylece görsel her makinede aynı çıkar.
Sayılar sitedeki sayılarla aynı tutulmalıdır (index.html, manifest.json).

Kullanım:
    python3 tools/generate-og-image.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "og-image.png"
FONTS = ROOT / "fonts"

W, H = 1200, 630

# Renkler (style.css ile eşleşir)
PRIMARY_DARK = (14, 74, 53)
PRIMARY = (26, 107, 78)
GOLD = (212, 168, 67)
GOLD_SOFT = (232, 200, 124)
CREAM = (250, 248, 244)
MUTED = (200, 220, 210)


def latin_alt_kumede(ch):
    """fontlar.css'teki 'latin' alt kümesinin unicode-range'i"""
    c = ord(ch)
    return (
        c <= 0xFF
        or c in (0x131, 0x152, 0x153, 0x2BB, 0x2BC, 0x2C6, 0x2DA, 0x2DC)
        or 0x2000 <= c <= 0x206F
    )


class Yazi:
    """latin + latin-ext alt kümelerini birlikte kullanan yazı tipi"""

    def __init__(self, aile, kalinlik, boyut):
        self.latin = ImageFont.truetype(str(FONTS / f"{aile}-{kalinlik}-normal-latin.woff2"), boyut)
        self.ext = ImageFont.truetype(str(FONTS / f"{aile}-{kalinlik}-normal-latin-ext.woff2"), boyut)
        # woff2 dosyaları değişken yazı tipi; ağırlık ekseni ayrıca ayarlanmalı
        for f in (self.latin, self.ext):
            try:
                f.set_variation_by_axes([kalinlik])
            except (OSError, AttributeError):
                pass

    def parcalar(self, metin):
        parca, font = "", None
        for ch in metin:
            f = self.latin if latin_alt_kumede(ch) else self.ext
            if font is not None and f is not font:
                yield parca, font
                parca = ""
            parca += ch
            font = f
        if parca:
            yield parca, font

    def genislik(self, metin):
        return sum(f.getlength(p) for p, f in self.parcalar(metin))


def vertical_gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", size, top)
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r = round(top[0] + (bottom[0] - top[0]) * t)
        g = round(top[1] + (bottom[1] - top[1]) * t)
        b = round(top[2] + (bottom[2] - top[2]) * t)
        for x in range(w):
            px[x, y] = (r, g, b)
    return img


def draw_centered(draw, y_center, metin, yazi, fill):
    """Metni yatayda ortalar; büyük harf yüksekliğini y_center'a oturtur."""
    x = W / 2 - yazi.genislik(metin) / 2
    bbox = yazi.latin.getbbox("H")
    y = y_center - (bbox[1] + bbox[3]) / 2
    for parca, font in yazi.parcalar(metin):
        draw.text((x, y), parca, font=font, fill=fill)
        x += font.getlength(parca)


def suslu_cizgi(draw, y, yarim=180):
    draw.line([(W / 2 - yarim, y), (W / 2 + yarim, y)], fill=GOLD, width=2)
    for cx in (W / 2 - yarim - 16, W / 2 + yarim + 16):
        draw.ellipse([cx - 4, y - 4, cx + 4, y + 4], fill=GOLD)


def main():
    img = vertical_gradient((W, H), PRIMARY_DARK, PRIMARY)
    draw = ImageDraw.Draw(img)

    # İnce altın çerçeve
    pad = 32
    draw.rectangle([pad, pad, W - pad, H - pad], outline=GOLD, width=2)

    draw_centered(draw, 100, "TAM İLMİHÂL", Yazi("literata", 400, 30), GOLD_SOFT)
    suslu_cizgi(draw, 145)

    draw_centered(draw, 232, "Se’âdet-i Ebediyye", Yazi("literata", 700, 92), CREAM)
    draw_centered(draw, 318, "İnteraktif İlmihâl", Yazi("literata", 400, 44), GOLD)

    draw_centered(
        draw,
        396,
        "241 madde · 9.863 dinî terim · 1020 hâl tercemesi",
        Yazi("inter", 400, 28),
        MUTED,
    )

    suslu_cizgi(draw, 450)
    draw_centered(draw, 500, "ilmihal.org", Yazi("inter", 700, 30), GOLD)
    draw_centered(
        draw,
        550,
        "Hüseyn Hilmi Işık hazretlerinin eseri · 1248 sayfa",
        Yazi("inter", 400, 22),
        MUTED,
    )

    img.save(OUT, format="PNG", optimize=True)
    size_kb = OUT.stat().st_size / 1024
    print(f"✓ {OUT.name} oluşturuldu ({W}x{H}, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
