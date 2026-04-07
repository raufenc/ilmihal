#!/usr/bin/env python3
"""
Excel → hukumler-data.js dönüşüm betiği
Se'âdet-i Ebediyye fıkhî hükümler listesi
"""

import pandas as pd
import json
import re
import os

BASE = "/Users/raufenc/Downloads"

FILES = {
    "farz":      f"{BASE}/tam_ilmihal_farz_sunnet_tam_cumle.xlsx",
    "sunnet_a":  f"{BASE}/saadet_i_ebediyye_sunnet_tam_cumle_duzeltilmis.xlsx",
    "sunnet_b":  f"{BASE}/tam_ilmihal_farz_sunnet_tam_cumle.xlsx",
    "vacib":     f"{BASE}/vacip_listesi_tam_ilmihal.xlsx",
    "mekruh":    f"{BASE}/Tam_Ilmihal_mekruh_tam_cumleler_duzeltilmis.xlsx",
    "haram":     f"{BASE}/tam_ilmihal_haram_tam_cumle_duzeltilmis.xlsx",
    "mubah":     f"{BASE}/Tam_Ilmihal_Mubah_Listesi_Duzeltilmis.xlsx",
    "mustehab":  f"{BASE}/Tam_Ilmihal_edep_mustehab_tam_cumle_duzeltilmis.xlsx",
}

# tocData'dan sayfa→madde lookup tablosu oluştur
# data.js'den tocData parse et
DATA_JS = os.path.join(os.path.dirname(__file__), "../data.js")


def parse_toc():
    """data.js'deki tocData'yı parse et, sayfa→madde lookup döndür."""
    try:
        with open(DATA_JS, "r", encoding="utf-8") as f:
            content = f.read()
        # tocData = [...] kısmını bul
        m = re.search(r'window\.tocData\s*=\s*(\[.*?\]);', content, re.DOTALL)
        if not m:
            m = re.search(r'var tocData\s*=\s*(\[.*?\]);', content, re.DOTALL)
        if not m:
            print("UYARI: tocData parse edilemedi, madde referansları olmayacak")
            return []
        toc = json.loads(m.group(1))
        return toc
    except Exception as e:
        print(f"UYARI: tocData okunamadı: {e}")
        return []


def find_madde(toc, sayfa):
    """Sayfa numarasına göre ilgili maddeyi bul."""
    if not sayfa or not toc:
        return None
    for m in toc:
        s_no = m.get("sayfa_no", 0) or 0
        s_bit = m.get("sayfa_bitis", s_no) or s_no
        if s_no <= sayfa <= s_bit:
            return m
    return None


def parse_sayfa(val):
    """'7-8', '123', '123-125' gibi değerleri (sayfa, sayfa_bitis) döndür."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None, None
    s = str(val).strip()
    m = re.match(r'^(\d+)\s*[-–]\s*(\d+)$', s)
    if m:
        return int(m.group(1)), int(m.group(2))
    m2 = re.match(r'^(\d+)', s)
    if m2:
        return int(m2.group(1)), None
    return None, None


def clean(val, max_len=None):
    """NaN kontrolü yapıp string döndür."""
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    s = str(val).strip()
    if max_len and len(s) > max_len:
        s = s[:max_len] + "…"
    return s


records = []
uid = [0]


def add(tur, katman, metin, sayfa, sayfa_bitis, alt_tur="", baglam="", konu="", toc=None):
    metin = clean(metin)
    if not metin or metin.lower() in ("nan", "none"):
        return
    uid[0] += 1
    s, sb = (sayfa, sayfa_bitis) if sayfa else (None, None)
    madde = find_madde(toc or [], s) if s else None
    rec = {
        "id": uid[0],
        "tur": tur,
        "katman": katman,
        "metin": metin,
        "sayfa": s,
        "sayfa_bitis": sb,
        "alt_tur": clean(alt_tur),
        "baglam": clean(baglam, max_len=300),
        "konu": clean(konu, max_len=120),
        "kisim": madde["kisim"] if madde else None,
        "madde_no": madde["madde_no"] if madde else None,
    }
    records.append(rec)


def load_sheet_with_header_row(path, sheet, header_row=0):
    """header_row: 0-indexed satır numarası (pandas header parametresi)."""
    df = pd.read_excel(path, sheet_name=sheet, header=header_row)
    # Boş satırları temizle
    df = df.dropna(how="all")
    return df


print("tocData parse ediliyor...")
toc = parse_toc()
print(f"  {len(toc)} madde yüklendi")


# ─── FARZ ────────────────────────────────────────────────────────────────────
print("\nFarz işleniyor...")
try:
    df = load_sheet_with_header_row(FILES["farz"], "Farz_Tam_Cümle")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add("farz", "acik", r.get("Tam cümle (kitaptaki imlâ ile)"),
            s, sb, r.get("Alt tür", ""), "", r.get("Bölüm başlığı", ""), toc)
    print(f"  Farz_Tam_Cümle: {len(df)} satır")

    df2 = load_sheet_with_header_row(FILES["farz"], "Farz_Liste_Bloğu")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add("farz", "acik", r.get("Tam blok / liste (kitaptaki imlâ ile)"),
            s, sb, r.get("Alt tür", ""), "", r.get("Bölüm başlığı", ""), toc)
    print(f"  Farz_Liste_Bloğu: {len(df2)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── SÜNNET ──────────────────────────────────────────────────────────────────
print("\nSünnet işleniyor (deduplicate)...")
sunnet_seen = set()  # (metin[:100], sayfa) tuple


def add_sunnet(katman, metin, sayfa, sayfa_bitis, alt_tur=""):
    metin = clean(metin)
    if not metin:
        return
    key = (metin[:100], sayfa)
    if key in sunnet_seen:
        return
    sunnet_seen.add(key)
    add("sunnet", katman, metin, sayfa, sayfa_bitis, alt_tur, "", "", toc)


try:
    # Kaynak A: sunnet_duzeltilmis - 01_Acik_Hukum (açık hükümler)
    df_a = load_sheet_with_header_row(FILES["sunnet_a"], "01_Acik_Hukum")
    for _, r in df_a.iterrows():
        s, sb = parse_sayfa(r.get("PDF Sayfa"))
        add_sunnet("acik", r.get("Tam Cümle (Aynen)"), s, sb, r.get("Tür", ""))
    print(f"  01_Acik_Hukum: {len(df_a)} satır")

    # Kaynak B: farz_sunnet - Sünnet_Tam_Cümle (deduplicate ile)
    df_b = load_sheet_with_header_row(FILES["sunnet_b"], "Sünnet_Tam_Cümle")
    before = len(sunnet_seen)
    for _, r in df_b.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add_sunnet("acik", r.get("Tam cümle (kitaptaki imlâ ile)"), s, sb, r.get("Alt tür", ""))
    print(f"  Sünnet_Tam_Cümle: {len(df_b)} satır ({len(sunnet_seen)-before} yeni)")

    df_b2 = load_sheet_with_header_row(FILES["sunnet_b"], "Sünnet_Liste_Bloğu")
    before2 = len(sunnet_seen)
    for _, r in df_b2.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add_sunnet("acik", r.get("Tam blok / liste (kitaptaki imlâ ile)"), s, sb, r.get("Alt tür", ""))
    print(f"  Sünnet_Liste_Bloğu: {len(df_b2)} satır ({len(sunnet_seen)-before2} yeni)")

    # Tüm geçişler: 02_Tum_Cumleler
    df_c = load_sheet_with_header_row(FILES["sunnet_a"], "02_Tum_Cumleler")
    before3 = len(sunnet_seen)
    for _, r in df_c.iterrows():
        s, sb = parse_sayfa(r.get("PDF Sayfa"))
        add_sunnet("tum", r.get("Tam Cümle (Aynen)"), s, sb, r.get("Tür", ""))
    print(f"  02_Tum_Cumleler: {len(df_c)} satır ({len(sunnet_seen)-before3} tum ekli)")
except Exception as e:
    print(f"  HATA: {e}")


# ─── VÂCİB ───────────────────────────────────────────────────────────────────
print("\nVâcib işleniyor...")
try:
    # Pozitif_Hukumler: header row 2 (0-indexed)
    df = pd.read_excel(FILES["vacib"], sheet_name="Pozitif_Hukumler", header=None)
    # Satır 2 (index 2) başlık satırı
    cols = df.iloc[2].tolist()
    df = df.iloc[3:].reset_index(drop=True)
    df.columns = [str(c).strip() for c in cols]
    df = df.dropna(how="all")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa Başlangıç"))
        _, sb2 = parse_sayfa(r.get("Sayfa Bitiş"))
        sb = sb2 or sb
        add("vacib", "acik", r.get("Tam Cümle"), s, sb, r.get("Kategori", ""), "", "", toc)
    print(f"  Pozitif_Hukumler: {len(df)} satır")

    # AnaMetin_TumCumleler: header row 2 de
    df2 = pd.read_excel(FILES["vacib"], sheet_name="AnaMetin_TumCumleler", header=None)
    cols2 = df2.iloc[2].tolist()
    df2 = df2.iloc[3:].reset_index(drop=True)
    df2.columns = [str(c).strip() for c in cols2]
    df2 = df2.dropna(how="all")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa Başlangıç"))
        _, sb2 = parse_sayfa(r.get("Sayfa Bitiş"))
        sb = sb2 or sb
        add("vacib", "tum", r.get("Tam Cümle"), s, sb, r.get("Kategori", ""), "", "", toc)
    print(f"  AnaMetin_TumCumleler: {len(df2)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── MEKRUH ──────────────────────────────────────────────────────────────────
print("\nMekruh işleniyor...")
try:
    df = load_sheet_with_header_row(FILES["mekruh"], "Acik_Mekruh_Hukumleri")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("PDF Sayfa"))
        add("mekruh", "acik", r.get("Tam cümle (aynen)"), s, sb,
            r.get("İfade türü", ""), r.get("Bağlam / paragraf (aynen)", ""), "", toc)
    print(f"  Acik_Mekruh_Hukumleri: {len(df)} satır")

    df2 = load_sheet_with_header_row(FILES["mekruh"], "Tum_Mekruh_Gecisleri")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("PDF Sayfa"))
        add("mekruh", "tum", r.get("Tam cümle (aynen)"), s, sb,
            r.get("İfade türü", ""), r.get("Bağlam / paragraf (aynen)", ""), "", toc)
    print(f"  Tum_Mekruh_Gecisleri: {len(df2)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── HARAM ───────────────────────────────────────────────────────────────────
print("\nHaram işleniyor...")
try:
    df = load_sheet_with_header_row(FILES["haram"], "Acik_Haram_Cumleleri")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa"))
        add("haram", "acik", r.get("Tam cümle (aynen)"), s, sb,
            r.get("Kalıp", ""), r.get("Bağlamlı tam ifade (aynen)", ""), "", toc)
    print(f"  Acik_Haram_Cumleleri: {len(df)} satır")

    df2 = load_sheet_with_header_row(FILES["haram"], "Tum_Haram_Gecisleri")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa"))
        add("haram", "tum", r.get("Tam cümle (aynen)"), s, sb,
            r.get("Kalıp", ""), "", "", toc)
    print(f"  Tum_Haram_Gecisleri: {len(df2)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── MÜBAH ───────────────────────────────────────────────────────────────────
print("\nMübah işleniyor...")
try:
    df = load_sheet_with_header_row(FILES["mubah"], "Ayrintili_Liste")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add("mubah", "acik", r.get("Tam cümle (aynen)"), s, sb,
            r.get("Sınıf", ""), r.get("Bağlam (aynen)", ""), r.get("Konu", ""), toc)
    print(f"  Ayrintili_Liste: {len(df)} satır")

    df2 = load_sheet_with_header_row(FILES["mubah"], "Tum_Gecisler_Denetim")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("PDF sayfa"))
        add("mubah", "tum", r.get("Tam cümle (aynen)"), s, sb,
            r.get("Sınıf", ""), r.get("Bağlam (aynen)", ""), "", toc)
    print(f"  Tum_Gecisler_Denetim: {len(df2)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── MÜSTEHAB ────────────────────────────────────────────────────────────────
print("\nMüstehab işleniyor...")
try:
    # Mustehab_Mendub
    df = load_sheet_with_header_row(FILES["mustehab"], "Mustehab_Mendub")
    for _, r in df.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa"))
        add("mustehab", "acik", r.get("Tam_Cümle_veya_Metin"), s, sb,
            r.get("Terim", ""), "", "", toc)
    print(f"  Mustehab_Mendub: {len(df)} satır")

    # Edeb_Acik_Ifade
    df2 = load_sheet_with_header_row(FILES["mustehab"], "Edeb_Acik_Ifade")
    for _, r in df2.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa"))
        add("mustehab", "acik", r.get("Tam_Cümle_veya_Metin"), s, sb,
            r.get("Terim", ""), "", "", toc)
    print(f"  Edeb_Acik_Ifade: {len(df2)} satır")

    # Abdest_Edebleri
    df3 = load_sheet_with_header_row(FILES["mustehab"], "Abdest_Edebleri")
    for _, r in df3.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa_Aralığı"))
        add("mustehab", "acik", r.get("Tam_Cümle_veya_Metin"), s, sb,
            "", "", r.get("Konu", ""), toc)
    print(f"  Abdest_Edebleri: {len(df3)} satır")

    # Yimek_Icme_Adabi
    df4 = load_sheet_with_header_row(FILES["mustehab"], "Yimek_Icme_Adabi")
    for _, r in df4.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa_Aralığı"))
        add("mustehab", "acik", r.get("Tam_Cümle_veya_Metin"), s, sb,
            "", "", r.get("Konu", ""), toc)
    print(f"  Yimek_Icme_Adabi: {len(df4)} satır")

    # Diger_Adab_Cumleleri
    df5 = load_sheet_with_header_row(FILES["mustehab"], "Diger_Adab_Cumleleri")
    for _, r in df5.iterrows():
        s, sb = parse_sayfa(r.get("Sayfa"))
        add("mustehab", "acik", r.get("Tam_Cümle_veya_Metin"), s, sb,
            "", "", r.get("Konu", ""), toc)
    print(f"  Diger_Adab_Cumleleri: {len(df5)} satır")
except Exception as e:
    print(f"  HATA: {e}")


# ─── ÇIKTI ───────────────────────────────────────────────────────────────────
# Sayfa 17 öncesi kayıtları çıkar (sitede madde karşılığı yok, önsöz/içindekiler)
before = len(records)
records = [r for r in records if r['sayfa'] and r['sayfa'] >= 17]
print(f"\nSayfa < 17 çıkarıldı: {before - len(records)} kayıt silindi")
print(f"Toplam kayıt: {len(records)}")

# Kategori özeti
from collections import Counter
c = Counter((r["tur"], r["katman"]) for r in records)
for (tur, katman), n in sorted(c.items()):
    print(f"  {tur:12s} {katman:6s}: {n}")

# JS dosyası yaz
out_path = os.path.join(os.path.dirname(__file__), "../hukumler-data.js")

# JSON serileştirme (None → null)
json_str = json.dumps(records, ensure_ascii=False, indent=None, separators=(',', ':'))

with open(out_path, "w", encoding="utf-8") as f:
    f.write("window.hukumlerData=")
    f.write(json_str)
    f.write(";")

size = os.path.getsize(out_path)
print(f"\nhukumler-data.js yazıldı: {out_path}")
print(f"Dosya boyutu: {size/1024:.1f} KB")
