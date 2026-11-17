#!/usr/bin/env python3
"""Silsile Atlası — arazi dokularını ve nehir çizgilerini üretir.

Kaynaklar (tools/silsile-kaynak/, depoya girmez):
  terrarium/6/x_y.png   bölge yükseklik karoları (Mapzen/AWS açık veri)
  terrarium/3/x_y.png   dünya yükseklik karoları
  ne_50m_land.geojson, ne_50m_lakes.geojson, ne_10m_rivers_lake_centerlines.geojson (Natural Earth, kamu malı)

Çıktılar (silsile-atlasi/doku/):
  bolge.webp, bolge-k.webp   bölge dokusu (R yükseklik, G/B eğim, A kıyı uzaklığı) büyük ve küçük boy
  kure.webp                  dünya dokusu, aynı kanallar
  nehir.webp, nehir-k.webp   nehir uzaklık dokusu
  arazi.json                 sınırlar + veri.js sırasıyla her kaydın arazi yüksekliği

Çalıştırma: /usr/local/bin/python3 tools/silsile-arazi.py
veri.js'te yalnız koordinat değiştiyse: /usr/local/bin/python3 tools/silsile-arazi.py --rakim
(dokuları yeniden üretmez; rakımları hazır bolge.webp'ten okur)
"""
import json, math, os, re, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = os.path.join(KOK, "tools", "silsile-kaynak")
CIKTI = os.path.join(KOK, "silsile-atlasi", "doku")
os.makedirs(CIKTI, exist_ok=True)

# Bölge sınırları (derece). atlas.js içindeki BOLGE ile aynı olmalı.
B_BATI, B_DOGU, B_GUNEY, B_KUZEY = 14.0, 96.0, 8.0, 54.0
B_W, B_H = 4096, 2298
H_MAX = 9000.0       # yükseklik kodlaması tavanı (m)
EGIM_MAX = 0.8       # eğim kodlaması tavanı
SDF_R = 16.0         # kıyı uzaklığı yarıçapı (çıktı pikseli)


def mozaik(z, x0, x1, y0, y1):
    """Karoları birleştirip metre cinsinden yükseklik dizisi döndürür."""
    n = 256
    dizi = np.zeros(((y1 - y0 + 1) * n, (x1 - x0 + 1) * n), dtype=np.float32)
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            im = np.asarray(Image.open(os.path.join(KAYNAK, "terrarium", str(z), f"{x}_{y}.png")).convert("RGB"), dtype=np.float32)
            h = im[..., 0] * 256.0 + im[..., 1] + im[..., 2] / 256.0 - 32768.0
            dizi[(y - y0) * n:(y - y0 + 1) * n, (x - x0) * n:(x - x0 + 1) * n] = h
    return dizi


def merkator_y(lat, z):
    """Enlem → dünya piksel y (z düzeyinde, 256 px karo)."""
    s = np.arcsinh(np.tan(np.radians(lat)))
    return (1.0 - s / math.pi) / 2.0 * (2 ** z) * 256.0


def esdikdortgen(moz, z, x0, y0, bati, dogu, guney, kuzey, W, H):
    """Merkator mozaiğini düz enlem-boylam ızgarasına yeniden örnekler."""
    lon = bati + (np.arange(W) + 0.5) / W * (dogu - bati)
    lat = kuzey - (np.arange(H) + 0.5) / H * (kuzey - guney)
    px = (lon + 180.0) / 360.0 * (2 ** z) * 256.0 - x0 * 256.0 - 0.5
    lat_k = np.clip(lat, -85.0, 85.0)
    py = merkator_y(lat_k, z) - y0 * 256.0 - 0.5
    yy, xx = np.meshgrid(py, px, indexing="ij")
    return ndimage.map_coordinates(moz, [yy, xx], order=1, mode="nearest").astype(np.float32)


def kara_maskesi(bati, dogu, guney, kuzey, W, H, ust=2):
    """Natural Earth kara + göl çokgenlerinden kara maskesi (1 kara, 0 su)."""
    w, h = W * ust, H * ust
    im = Image.new("L", (w, h), 0)
    ciz = ImageDraw.Draw(im)

    def nokta(halka):
        return [((x - bati) / (dogu - bati) * w, (kuzey - y) / (kuzey - guney) * h) for x, y in halka]

    def cokgenler(dosya):
        with open(os.path.join(KAYNAK, dosya)) as f:
            g = json.load(f)
        for oz in g["features"]:
            geo = oz["geometry"]
            if geo is None:
                continue
            liste = [geo["coordinates"]] if geo["type"] == "Polygon" else geo["coordinates"]
            for cok in liste:
                xs = [p[0] for p in cok[0]]; ys = [p[1] for p in cok[0]]
                if max(xs) < bati - 1 or min(xs) > dogu + 1 or max(ys) < guney - 1 or min(ys) > kuzey + 1:
                    continue
                alan = (max(xs) - min(xs)) * (max(ys) - min(ys))
                yield alan, cok

    for alan, cok in sorted(cokgenler("ne_50m_land.geojson"), key=lambda t: -t[0]):
        ciz.polygon(nokta(cok[0]), fill=255)
        for delik in cok[1:]:
            ciz.polygon(nokta(delik), fill=0)
    for alan, cok in sorted(cokgenler("ne_50m_lakes.geojson"), key=lambda t: -t[0]):
        ciz.polygon(nokta(cok[0]), fill=0)
        for ada in cok[1:]:
            ciz.polygon(nokta(ada), fill=255)
    return np.asarray(im, dtype=np.uint8) > 127


def doku_uret(yuk, kara_ust, bati, dogu, guney, kuzey, ust=2):
    """Yükseklik + kara maskesinden RGBA doku dizisi."""
    H, W = yuk.shape
    # kıyı uzaklığı (işaretli), üst örneklemede hesaplanıp küçültülür
    ic = ndimage.distance_transform_edt(kara_ust)
    dis = ndimage.distance_transform_edt(~kara_ust)
    sd = (ic - dis) / ust
    sd = sd.reshape(H, ust, W, ust).mean(axis=(1, 3))
    kara = kara_ust.reshape(H, ust, W, ust).mean(axis=(1, 3))
    alfa = np.clip(0.5 + sd / (2.0 * SDF_R), 0.0, 1.0)

    # su yüzeyi düz: denizde 0, yüksek göllerde gölün kendi rakımı korunur
    h = np.maximum(yuk, 0.0)
    h = np.where((kara < 0.5) & (yuk < 30.0), 0.0, h)
    h = ndimage.gaussian_filter(h, 0.6)

    lat = kuzey - (np.arange(H) + 0.5) / H * (kuzey - guney)
    dy = 111320.0 * (kuzey - guney) / H
    dx = dy * (dogu - bati) / W / ((kuzey - guney) / H) * np.cos(np.radians(lat))[:, None]
    dx = np.maximum(dx, dy * 0.05)
    gy, gx = np.gradient(h)
    ex = gx / dx           # doğuya doğru eğim
    ny = -gy / dy          # kuzeye doğru eğim (satır aşağı = güney)

    def kodla(s):
        v = np.sign(s) * np.sqrt(np.minimum(np.abs(s), EGIM_MAX) / EGIM_MAX)
        return v * 0.5 + 0.5

    r = np.sqrt(np.clip(h, 0, H_MAX) / H_MAX)
    rgba = np.stack([r, kodla(ex), kodla(ny), alfa], axis=-1)
    return (np.clip(rgba, 0, 1) * 255.0 + 0.5).astype(np.uint8), h


def basitlestir(noktalar, tol):
    """Douglas–Peucker."""
    if len(noktalar) < 3:
        return noktalar
    tut = [False] * len(noktalar)
    tut[0] = tut[-1] = True
    yigin = [(0, len(noktalar) - 1)]
    while yigin:
        a, b = yigin.pop()
        ax, ay = noktalar[a]; bx, by = noktalar[b]
        dx, dy = bx - ax, by - ay
        boy = math.hypot(dx, dy) or 1e-12
        en, ix = 0.0, -1
        for i in range(a + 1, b):
            px, py = noktalar[i]
            d = abs((px - ax) * dy - (py - ay) * dx) / boy
            if d > en:
                en, ix = d, i
        if en > tol and ix > 0:
            tut[ix] = True
            yigin.append((a, ix)); yigin.append((ix, b))
    return [p for p, t in zip(noktalar, tut) if t]


def nehir_dokusu(ust=2, yaricap=7.0):
    """Nehirleri bölge ızgarasında uzaklık alanı olarak üretir (1 = nehir ekseni)."""
    with open(os.path.join(KAYNAK, "ne_10m_rivers_lake_centerlines.geojson")) as f:
        g = json.load(f)
    w, h = B_W * ust, B_H * ust
    ana = Image.new("L", (w, h), 0); ince = Image.new("L", (w, h), 0)
    ca, ci = ImageDraw.Draw(ana), ImageDraw.Draw(ince)
    buyuk = re.compile(r"Amu|Syr|Tigris|Dicle|Euphrates|Firat|Furat|Indus|Ganges|Nile|Volga|Danube|Shatt", re.I)
    adlar = set(); say = 0
    for oz in g["features"]:
        p = oz["properties"]; geo = oz["geometry"]
        if geo is None or p.get("featurecla") != "River":
            continue
        ad = p.get("name_en") or p.get("name") or ""
        derece = p.get("scalerank", 9)
        if derece > 7:
            continue
        hatlar = [geo["coordinates"]] if geo["type"] == "LineString" else geo["coordinates"]
        for hat in hatlar:
            if not any(B_BATI <= q[0] <= B_DOGU and B_GUNEY <= q[1] <= B_KUZEY for q in hat):
                continue
            nk = [((q[0] - B_BATI) / (B_DOGU - B_BATI) * w, (B_KUZEY - q[1]) / (B_KUZEY - B_GUNEY) * h) for q in hat]
            (ca if (derece <= 4 or buyuk.search(ad)) else ci).line(nk, fill=255, width=1)
            say += 1
            if ad: adlar.add(ad)
    da = ndimage.distance_transform_edt(np.asarray(ana) < 128) / ust
    di = ndimage.distance_transform_edt(np.asarray(ince) < 128) / ust
    d = np.minimum(da, di + 0.3)          # küçük nehirler biraz daha ince
    v = np.clip(1.0 - d / yaricap, 0.0, 1.0)
    v = v.reshape(B_H, ust, B_W, ust).mean(axis=(1, 3))
    print("  nehir hattı", say, "| adlar:", ", ".join(sorted(adlar)))
    return (v * 255.0 + 0.5).astype(np.uint8)


def webp(dizi, ad, kalite=86):
    yol = os.path.join(CIKTI, ad)
    Image.fromarray(dizi, "RGBA").save(yol, "WEBP", quality=kalite, method=6, alpha_quality=100, exact=True)
    print(f"  {ad}: {dizi.shape[1]}x{dizi.shape[0]}  {os.path.getsize(yol)/1024:.0f} KB")


def main():
    print("Bölge mozaiği…")
    moz = mozaik(6, 34, 49, 20, 30)
    yuk = esdikdortgen(moz, 6, 34, 20, B_BATI, B_DOGU, B_GUNEY, B_KUZEY, B_W, B_H)
    print("  yükseklik aralığı", float(yuk.min()), float(yuk.max()))
    kara = kara_maskesi(B_BATI, B_DOGU, B_GUNEY, B_KUZEY, B_W, B_H)
    rgba, h_bolge = doku_uret(yuk, kara, B_BATI, B_DOGU, B_GUNEY, B_KUZEY)
    webp(rgba, "bolge.webp")
    kucuk = np.asarray(Image.fromarray(rgba, "RGBA").resize((B_W // 2, B_H // 2), Image.LANCZOS))
    webp(kucuk, "bolge-k.webp")

    print("Dünya mozaiği…")
    moz3 = mozaik(3, 0, 7, 0, 7)
    GW, GH = 2048, 1024
    yuk3 = esdikdortgen(moz3, 3, 0, 0, -180, 180, -90, 90, GW, GH)
    lat3 = 90 - (np.arange(GH) + 0.5) / GH * 180
    yuk3[lat3 > 85.0, :] = 0.0
    kara3 = kara_maskesi(-180, 180, -90, 90, GW, GH)
    rgba3, _ = doku_uret(yuk3, kara3, -180, 180, -90, 90)
    webp(rgba3, "kure.webp")

    print("Nehirler…")
    nd = nehir_dokusu()
    for ad, dizi in (("nehir.webp", nd), ("nehir-k.webp", np.asarray(Image.fromarray(nd, "L").resize((B_W // 2, B_H // 2), Image.LANCZOS)))):
        yol = os.path.join(CIKTI, ad)
        Image.fromarray(dizi, "L").save(yol, "WEBP", quality=82, method=6)
        print(f"  {ad}: {os.path.getsize(yol)/1024:.0f} KB")

    rakim_yaz(h_bolge)


def rakim_yaz(h_bolge):
    """veri.js'teki her kaydın (sırasıyla) arazi yüksekliğini arazi.json'a yazar."""
    kaynak = open(os.path.join(KOK, "silsile-atlasi", "veri.js"), encoding="utf-8").read()
    koor = re.findall(r"koordinat:\s*\[\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\]", kaynak)
    rakim = []
    for la, lo in koor:
        la, lo = float(la), float(lo)
        x = int((lo - B_BATI) / (B_DOGU - B_BATI) * B_W); y = int((B_KUZEY - la) / (B_KUZEY - B_GUNEY) * B_H)
        x = min(max(x, 1), B_W - 2); y = min(max(y, 1), B_H - 2)
        rakim.append(int(round(float(h_bolge[y - 1:y + 2, x - 1:x + 2].mean()))))   # 3×3 ortalama: sahnedeki yumuşatılmış araziye yakın
    print("  rakımlar", len(rakim), rakim)

    with open(os.path.join(CIKTI, "arazi.json"), "w", encoding="utf-8") as f:
        json.dump({"bolge": [B_BATI, B_DOGU, B_GUNEY, B_KUZEY], "hmax": H_MAX, "egim": EGIM_MAX,
                   "sdf": SDF_R, "rakim": rakim}, f, separators=(",", ":"))


def rakim_yenile():
    """Dokuları yeniden üretmeden, hazır bolge.webp'in yükseklik kanalından rakımları okur."""
    im = np.asarray(Image.open(os.path.join(CIKTI, "bolge.webp")).convert("RGBA")).astype(np.float32)
    assert im.shape[1] == B_W and im.shape[0] == B_H, im.shape
    rakim_yaz((im[..., 0] / 255.0) ** 2 * H_MAX)


if __name__ == "__main__":
    rakim_yenile() if "--rakim" in sys.argv else main()
