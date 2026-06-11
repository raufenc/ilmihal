#!/usr/bin/env python3
"""
ilmihal.org için Open Graph paylaşım görseli üretir.
Çıktı: og-image.png (1200x630)

Kullanım:
    python3 tools/generate-og-image.py
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "og-image.png"

W, H = 1200, 630

# Renkler (style.css ile eşleşir)
PRIMARY_DARK = (14, 74, 53)
PRIMARY = (26, 107, 78)
PRIMARY_LIGHT = (38, 140, 103)
GOLD = (212, 168, 67)
GOLD_SOFT = (232, 200, 124)
CREAM = (250, 248, 244)
MUTED = (200, 220, 210)


def load_font(preferred, size):
    candidates = preferred + [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


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


def draw_centered(draw, xy_center, text, font, fill):
    cx, cy = xy_center
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw / 2 - bbox[0], cy - th / 2 - bbox[1]), text, font=font, fill=fill)


def main():
    img = vertical_gradient((W, H), PRIMARY_DARK, PRIMARY)
    draw = ImageDraw.Draw(img, "RGBA")

    # İnce altın süs çerçeve
    pad = 32
    draw.rectangle(
        [pad, pad, W - pad, H - pad],
        outline=GOLD + (160,) if False else GOLD,  # pillow strict tuple
        width=2,
    )

    # Merkez altın süsleme çizgileri
    cy_center = H // 2
    line_w = 180
    draw.line([(W / 2 - line_w, 150), (W / 2 + line_w, 150)], fill=GOLD, width=2)
    draw.line([(W / 2 - line_w, H - 150), (W / 2 + line_w, H - 150)], fill=GOLD, width=2)

    # Küçük baklava/nokta süsleme
    for cx in [W / 2 - line_w - 16, W / 2 + line_w + 16]:
        draw.ellipse([cx - 4, 146, cx + 4, 154], fill=GOLD)
        draw.ellipse([cx - 4, H - 154, cx + 4, H - 146], fill=GOLD)

    # Üst bant: "Tam İlmihâl"
    top_label_font = load_font(
        [
            "/System/Library/Fonts/Supplemental/Georgia.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        ],
        30,
    )
    draw_centered(draw, (W / 2, 105), "TAM İLMİHÂL", top_label_font, GOLD_SOFT)

    # Ana başlık — Se'âdet-i Ebediyye
    title_font = load_font(
        [
            "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
        ],
        96,
    )
    draw_centered(draw, (W / 2, 240), "Se'âdet-i Ebediyye", title_font, CREAM)

    # Alt başlık
    sub_font = load_font(
        [
            "/System/Library/Fonts/Supplemental/Georgia.ttf",
            "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        ],
        46,
    )
    draw_centered(draw, (W / 2, 325), "İnteraktif İlmihâl", sub_font, GOLD)

    # Açıklama
    desc_font = load_font(
        [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ],
        28,
    )
    draw_centered(
        draw,
        (W / 2, 410),
        "241 madde · 4400+ dinî terim · 1019 âlim biyografisi",
        desc_font,
        MUTED,
    )

    # Alt — domain
    domain_font = load_font(
        [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        ],
        28,
    )
    draw_centered(draw, (W / 2, 485), "ilmihal.org", domain_font, GOLD)

    # Kitap yazarı atıf
    author_font = load_font(
        ["/System/Library/Fonts/Supplemental/Arial.ttf"], 22
    )
    draw_centered(
        draw,
        (W / 2, 540),
        "Hüseyn Hilmi Işık hazretlerinin eseri · 1248 sayfa",
        author_font,
        MUTED,
    )

    img.save(OUT, format="PNG", optimize=True)
    size_kb = OUT.stat().st_size / 1024
    print(f"✓ {OUT.name} oluşturuldu ({W}x{H}, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
