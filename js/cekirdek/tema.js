/* Tema: gündüz (kâğıt), sepya, gece. Eski sitenin 'ilmihal-theme' anahtarı ve
   değerleri (light | sepia | dark, düz dizgi) aynen korunur. */

import { depo } from './depo.js';

const ANAHTAR = 'ilmihal-theme';
const ESKIDEN = { light: 'gunduz', sepia: 'sepya', dark: 'gece' };
const ESKIYE = { gunduz: 'light', sepya: 'sepia', gece: 'dark' };
const ZEMIN = { gunduz: '#f4efe4', sepya: '#ecdfc4', gece: '#0a0d14' };
export const TEMALAR = [
  { ad: 'gunduz', etiket: 'Gündüz' },
  { ad: 'sepya', etiket: 'Sepya' },
  { ad: 'gece', etiket: 'Gece' }
];

export function temaOku() {
  const kayitli = ESKIDEN[depo.alDuz(ANAHTAR)];
  if (kayitli) return kayitli;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'gece' : 'gunduz';
}

export function temaUygula(tema = temaOku()) {
  document.documentElement.dataset.tema = tema;
  let meta = document.head.querySelector('meta[name="theme-color"]');
  if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
  meta.content = ZEMIN[tema];
  return tema;
}

export function temaYaz(tema) {
  if (!ESKIYE[tema]) return temaOku();
  depo.yazDuz(ANAHTAR, ESKIYE[tema]);
  temaUygula(tema);
  dispatchEvent(new CustomEvent('ilmihal:tema', { detail: { tema } }));
  return tema;
}

// Kullanıcı seçim yapmadıysa sistem ayarını izle
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!ESKIDEN[depo.alDuz(ANAHTAR)]) temaUygula();
});
