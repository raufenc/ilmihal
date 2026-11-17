import json, collections
from ortak import *
exec(open('bulgu1.py').read())
fih = {f"{m['kisim']}-{m['no']}": m for m in json.load(open(KOK+'/fihrist.json'))['maddeler']}
for x in B:
    m = x['madde']
    if m and m in fih and fih[m]['sahife'][0]==fih[m]['sahife'][1]:
        x['sahife'] = fih[m]['sahife'][0]
    else:
        x['sahife'] = None
    if x['kimlik'].startswith('konu_haritasi /') and x['kitap'] and x['madde']:
        x['kitap'] = 'Madde başlığı (fihrist): ' + x['kitap']
json.dump(B, open('/Users/raufenc/Documents/Claude 2/ilmihal-site/tools/yeni-site/denetim/tablolar-1.json','w'), ensure_ascii=False, indent=1)
H = {
'konu_haritasi':('düzeltilmeli','denetlenemedi (s. 11 madde metni dışında)'),
'tovbe_sartlari':('düzeltilmeli','kısmen (madde doğru; alıntı ilgisiz; bir adım 1-74’te)'),
'iman_sartlari':('düzeltilmeli','hayır (sayım 2-49’da)'),
'islam_sartlari':('düzeltilmeli','evet'),
'allahin_sifatlari':('doğru','evet'),
'peygamber_sifatlari':('düzeltilmeli','evet'),
'namaz_rekatlari':('doğru','evet'),
'abdest_adimlari':('düzeltilmeli','evet'),
'abdesti_bozanlar':('düzeltilmeli','evet'),
'gusul_gerektiren':('düzeltilmeli','kısmen (alıntı farzları anlatıyor)'),
'teyemmum_adimlari':('düzeltilmeli','evet'),
'necaset_turleri':('düzeltilmeli','evet'),
'namaz_farzlari':('düzeltilmeli','kısmen (alıntıya kitapta olmayan cümle eklenmiş)'),
'namaz_sunnetleri':('düzeltilmeli','kısmen (alıntı ilgisiz)'),
'namaz_vacibleri':('düzeltilmeli','evet'),
'namaz_bozanlar':('düzeltilmeli','evet'),
'namaz_mekruhlari':('düzeltilmeli','evet'),
'cuma_namazi':('düzeltilmeli','evet'),
'bayram_namazi':('doğru','evet'),
'zekat_nisab':('düzeltilmeli','evet'),
'zekat_kimlere_verilir':('düzeltilmeli','evet'),
'oruc_bozanlar':('düzeltilmeli','kısmen (alıntı ilgisiz)'),
'oruc_turleri':('düzeltilmeli','evet'),
'hac_adimlari':('düzeltilmeli','evet'),
'umre_adimlari':('düzeltilmeli','evet'),
'mubarek_geceler':('doğru','evet'),
'haram_helal_hayvanlar':('düzeltilmeli','kısmen (helâl sütunu 2-41’de yok)'),
'haram_helal_yiyecekler':('kaldırılmalı','hayır (2-42’nin içeriği tabloda yok)'),
'cenaze_namazi':('düzeltilmeli','evet'),
'kitabin_tanimlari':('atlandı (başka ajan)','—'),
'otuzuc_farz':('doğru','evet'),
'abdest_sunnetleri':('düzeltilmeli','evet'),
'teyemmum_yedi_hal':('düzeltilmeli','evet'),
'ezanin_kelimeleri':('doğru','evet'),
'seferilik_kurallari':('düzeltilmeli','evet'),
'yemin_turleri':('doğru','evet'),
'uc_cesit_haci':('doğru','evet (alıntıda "umre" → "ömre")'),
'hac_sartlari':('düzeltilmeli','evet'),
'ibadet_uc_kisim':('düzeltilmeli','evet'),
'dua_sartlari':('doğru','evet'),
'vera_on_sart':('doğru','evet'),
'selam_hukumleri':('doğru','evet'),
'tabi_olma_dereceleri':('doğru','evet'),
'fikh_dort_kisim':('düzeltilmeli','kısmen (alıntı kitapta yok)'),
'imansiz_on_sebep':('düzeltilmeli','evet'),
'kefen_bilgisi':('doğru','evet'),
'katl_turleri':('düzeltilmeli','evet'),
'efali_mukellefin':('düzeltilmeli','kısmen (tarifler 1-28 ve 1-68’den)'),
'gusul_adimlari':('düzeltilmeli','kısmen (alıntı ilgisiz)'),
'sularin_hukmu':('düzeltilmeli','evet'),
'setr_avret':('düzeltilmeli','evet'),
'nikah_sartlari':('düzeltilmeli','kısmen (alıntı ilgisiz)'),
'sadaka_fitr':('düzeltilmeli','evet'),
'kurban_hukumleri':('düzeltilmeli','kısmen (alıntı ilgisiz)'),
'hadis_cesitleri':('düzeltilmeli','evet'),
'nafile_namazlar':('kaldırılmalı','hayır (1-60’ta yalnız Evvâbîn)'),
'islamiyyetin_temeli':('denetlenemedi','denetlenemedi (s. 16 madde metni dışında)'),
'amel_uce_ayrilir':('düzeltilmeli (yalnız alıntı)','kısmen (alıntı ilgisiz)'),
'islam_bilgileri_ikiye':('doğru','evet'),
'kuran_bilgiler_uc':('düzeltilmeli (yalnız atıf/alıntı)','hayır (kaynak 1-25)'),
'kuran_ahkam_uc':('doğru','evet'),
'resulullah_yaptiklari':('doğru','evet'),
'sunnet_tasnifi':('düzeltilmeli (yalnız alıntı)','kısmen (alıntı ilgisiz)'),
'kafirlerin_yaptiklari':('doğru','evet'),
'bidat_uc_tur':('doğru','evet (alıntı kırpılmış)'),
}
d = json.load(open(f"{KOK}/tablolar/dizin.json"))['tablolar'][:65]
cnt = collections.Counter(x['kimlik'].split(' / ')[0] for x in B)
sc = collections.defaultdict(collections.Counter)
for x in B: sc[x['kimlik'].split(' / ')[0]][x['sinif']]+=1
rows=[]
for i,t in enumerate(d,1):
    h,k = H[t['id']]
    s = sc[t['id']]
    rows.append(f"| {i} | `{t['id']}` | {t['baslik']} | {t['tip']} | {t['kaynakMadde'] or '—'} s.{t['sahife']} | {k} | **{h}** | {cnt[t['id']]} ({', '.join(f'{c}{s[c]}' for c in 'KDYB' if s[c]) or '—'}) |")
open('cizelge.md','w').write('\n'.join(rows))
tot = collections.Counter(x['sinif'] for x in B)
print(tot, len(B)); print(collections.Counter(v[0].split(' (')[0] for v in H.values()))
