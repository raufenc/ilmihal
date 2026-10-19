#!/usr/bin/env python3
"""
ozetler.js dosyasını üretir: her maddenin kitaptaki ilk satırları
(ana sayfadaki Günün Maddesi kartı ve önizlemeler için) ve okuma planında
günlük bölümleri hesaplamak için her maddenin harf sayısı.

Metin kitaptan aynen alınır; yalnızca başlık satırı, şiir/tablo blokları ve
dipnotlar atlanır, ~300 harfte kelime sınırından kesilir.

Kullanım:
    python3 tools/generate-ozetler.py
"""

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def toc_oku():
    betik = ("const fs=require('fs');const s=fs.readFileSync('data.js','utf8');"
             "const m=s.match(/(?:const|var|let)\\s+tocData\\s*=\\s*(\\[[\\s\\S]*?\\]);/);"
             "console.log(JSON.stringify(eval(m[1])))")
    return json.loads(subprocess.run(["node", "-e", betik], cwd=ROOT, capture_output=True, text=True, check=True).stdout)


def buyuk_harfli(p):
    harfler = [c for c in p if c.isalpha()]
    return harfler and sum(c.isupper() for c in harfler) >= 0.7 * len(harfler)


def uygun(p):
    if "⟦" in p or re.match(r"^\[\d\]", p):
        return False
    if buyuk_harfli(p) and len(p) < 160:
        return False
    if "\n" in p:
        return False
    return len(p) >= 25


def main():
    metinler = {k: json.loads((ROOT / f"texts/kisim{k}.json").read_text(encoding="utf-8")) for k in (1, 2, 3)}
    ozetler = {}
    uzunluklar = {}
    for t in toc_oku():
        k, m = t["kisim"], t["madde_no"]
        ham = re.sub(r"^\d+\s*[—–-]\s*", "", metinler[k][str(m)])
        # okuma planı için metin uzunluğu (işaretler ve fazla boşluk hariç harf sayısı)
        uzunluklar[f"{k}/{m}"] = len(re.sub(r"\s+", " ", re.sub(r"⟦[^⟧]*⟧", "", ham)).strip())
        paragraflar = [p.strip() for p in ham.split("\n\n") if p.strip()]
        adaylar = [re.sub(r"\s+", " ", p) for p in paragraflar if uygun(p)] or [re.sub(r"\s+", " ", paragraflar[0])]
        ozet, i = adaylar[0], 1
        while (len(ozet) < 200 or ozet.endswith(":")) and i < len(adaylar):
            ozet += " " + adaylar[i]
            i += 1
        if len(ozet) > 300:
            kes = ozet[:300]
            kes = kes[:kes.rfind(" ")].rstrip(",;:—–-")
            ozet = kes if kes.endswith(("!", "?")) else kes.rstrip(".") + "…"
        ozetler[f"{k}/{m}"] = ozet
    js = ("// Her maddenin kitaptan ilk satırları (ana sayfa ve önizlemeler için; metin aynen alınmıştır)\n"
          "// Üretici: tools/generate-ozetler.py\n"
          "window.maddeOzetleri = " + json.dumps(ozetler, ensure_ascii=False, separators=(",", ":")) + ";\n"
          "// Okuma planı için her maddenin harf sayısı\n"
          "window.maddeUzunluklari = " + json.dumps(uzunluklar, separators=(",", ":")) + ";\n")
    (ROOT / "ozetler.js").write_text(js, encoding="utf-8")
    print(f"✓ ozetler.js: {len(ozetler)} madde, {len(js.encode()) // 1024} KB, toplam {sum(uzunluklar.values()):,} harf")


if __name__ == "__main__":
    main()
