#!/usr/bin/env python3
"""
Sitenin süs görsellerini (gorsel/*.svg) üretir:
  desen.svg                    — 8 köşeli yıldız (hâtem) desen karosu
  madalyon.svg / madalyon-koyu.svg — madde numarası madalyonu
  kapak.svg                    — ana sayfadaki kitap kapağının şemse ve köşebentleri
  ayrac.svg                    — sayfa başlıklarının altındaki süslü ayraç

Kullanım:
    python3 tools/generate-gorseller.py
"""

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "gorsel"

ALTIN = "#c9a84c"
ALTIN_ACIK = "#d9bd73"


def yildiz(cx, cy, R):
    """İki karenin birleşiminden oluşan 8 köşeli yıldızın dış çizgisi (16 köşe)."""
    ri = R / (math.sqrt(2) * math.cos(math.radians(22.5)))
    noktalar = []
    for k in range(16):
        aci = math.radians(-90 + k * 22.5)
        r = R if k % 2 == 0 else ri
        noktalar.append((cx + r * math.cos(aci), cy + r * math.sin(aci)))
    return "M" + "L".join(f"{x:.2f} {y:.2f}" for x, y in noktalar) + "Z"


def desen(renk):
    T = 64
    yildizlar = [yildiz(32, 32, 13)] + [yildiz(x, y, 13) for x in (0, T) for y in (0, T)]
    baklavalar = [f"M{x} {y-5}L{x+5} {y}L{x} {y+5}L{x-5} {y}Z" for x, y in ((32, 0), (32, T), (0, 32), (T, 32))]
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{T}' height='{T}' viewBox='0 0 {T} {T}'>"
        f"<g fill='none' stroke='{renk}' stroke-width='1'>"
        f"<path d='{' '.join(yildizlar)}'/><path d='{' '.join(baklavalar)}'/>"
        f"<circle cx='32' cy='32' r='4.5'/></g></svg>"
    )


def madalyon(zemin, cizgi):
    return (
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
        f"<path d='{yildiz(32, 32, 30)}' fill='{zemin}' stroke='{cizgi}' stroke-width='1.3' stroke-linejoin='round'/>"
        f"<path d='{yildiz(32, 32, 25.5)}' fill='none' stroke='{cizgi}' stroke-width='.6' stroke-linejoin='round'/>"
        f"<circle cx='32' cy='32' r='17' fill='none' stroke='{cizgi}' stroke-width='.8'/></svg>"
    )


def semse(cx, cy, rx, ry, dilim=26, genlik=0.018):
    """Kenarı ince dilimli badem biçimli orta süs (şemse)."""
    noktalar = []
    for i in range(0, 361, 2):
        t = math.radians(i)
        rr = 1 + genlik * math.cos(dilim * t)
        noktalar.append((cx + rx * rr * math.sin(t), cy - ry * rr * math.cos(t)))
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in noktalar) + "Z"


def kosebent(x, y, sx, sy):
    yon = 1 if sx * sy > 0 else 0
    parcalar = []
    for r in (34, 27):
        parcalar.append(f"M{x} {y + sy * r} A{r} {r} 0 0 {yon} {x + sx * r} {y}")
    return " ".join(parcalar)


def kapak():
    W, H = 228, 328
    cx, cy = W / 2, H / 2
    koseler = " ".join([kosebent(8, 8, 1, 1), kosebent(W - 8, 8, -1, 1),
                        kosebent(8, H - 8, 1, -1), kosebent(W - 8, H - 8, -1, -1)])
    salbek = (f"M{cx} {cy - 120} l-7 10 l7 6 l7 -6 z "
              f"M{cx} {cy + 120} l-7 -10 l7 -6 l7 6 z")
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' fill='none' stroke='{ALTIN_ACIK}'>"
        f"<rect x='1' y='1' width='{W - 2}' height='{H - 2}' rx='2' stroke-width='1.2'/>"
        f"<rect x='6' y='6' width='{W - 12}' height='{H - 12}' rx='1' stroke-width='.6'/>"
        f"<path d='{koseler}' stroke-width='.8'/>"
        f"<path d='{semse(cx, cy, 70, 104)}' stroke-width='1.1'/>"
        f"<path d='{semse(cx, cy, 62, 95, genlik=0)}' stroke-width='.5'/>"
        f"<path d='{salbek}' stroke-width='.8'/></svg>"
    )


def ayrac(renk):
    """Sayfa başlıklarının altındaki süslü ayraç."""
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 20' fill='none' stroke='{renk}'>"
        "<path d='M0 10h104M156 10h104M110 10h6M144 10h6'/>"
        f"<circle cx='104' cy='10' r='1.6' fill='{renk}' stroke='none'/><circle cx='156' cy='10' r='1.6' fill='{renk}' stroke='none'/>"
        f"<g transform='translate(130 10)'><path d='M0-8l2.3 5.7L8 0 2.3 2.3 0 8-2.3 2.3-8 0-2.3-2.3z' fill='{renk}' stroke='none'/>"
        "<rect x='-5' y='-5' width='10' height='10' transform='rotate(45)'/></g></svg>"
    )


def main():
    OUT.mkdir(exist_ok=True)
    dosyalar = {
        "desen.svg": desen(ALTIN_ACIK),
        "madalyon.svg": madalyon("#fbf6e9", "#b8923a"),
        "madalyon-koyu.svg": madalyon("#24242b", "#d4b65c"),
        "kapak.svg": kapak(),
        "ayrac.svg": ayrac(ALTIN),
    }
    for ad, icerik in dosyalar.items():
        (OUT / ad).write_text(icerik + "\n", encoding="utf-8")
        print(f"✓ gorsel/{ad} ({len(icerik)} bayt)")


if __name__ == "__main__":
    main()
