// Recomendação diária de passagens: o app escolhe o texto, não o usuário.
// Seleção determinística por pessoa + dia + sentimento, evitando repetir textos recentes.
import { BOOKS } from './books';
import type { Entry, Profile } from './storage';

export type Mood = { id: string; label: string; emoji: string };
export const MOODS: Mood[] = [
  { id: 'ansioso', label: 'Ansioso(a)', emoji: '😟' },
  { id: 'triste', label: 'Triste', emoji: '😢' },
  { id: 'cansado', label: 'Cansado(a)', emoji: '😮‍💨' },
  { id: 'grato', label: 'Grato(a)', emoji: '🙏' },
  { id: 'direcao', label: 'Buscando direção', emoji: '🧭' },
  { id: 'medo', label: 'Com medo', emoji: '😨' },
  { id: 'crescer', label: 'Quero crescer', emoji: '🌱' },
  { id: 'culpa', label: 'Precisando de perdão', emoji: '🤍' },
];

// [abreviação, capítulo, versículo inicial, versículo final]
type P = [string, number, number, number];
const BANK: Record<string, P[]> = {
  ansioso: [['fp',4,6,7],['mt',6,25,34],['1pe',5,6,7],['sl',55,22,22],['is',26,3,4],['jo',14,1,3],['sl',94,18,19],['sl',46,1,3],['jo',14,27,27],['mt',11,28,30],['sl',121,1,8],['pv',3,5,6]],
  triste: [['sl',34,17,18],['sl',30,4,5],['ap',21,3,4],['mt',5,3,4],['sl',42,5,5],['is',41,10,10],['2co',1,3,4],['jo',16,20,22],['lm',3,22,24],['sl',147,3,3],['rm',8,18,18],['sl',23,1,6]],
  cansado: [['mt',11,28,30],['is',40,28,31],['gl',6,9,9],['sl',23,1,3],['2co',4,16,18],['hb',12,1,3],['sl',62,1,2],['ex',33,14,14],['1rs',19,4,8],['sl',127,1,2],['is',58,11,11]],
  grato: [['sl',100,1,5],['sl',103,1,5],['1ts',5,16,18],['cl',3,15,17],['sl',136,1,9],['tg',1,17,17],['sl',118,24,24],['ef',1,3,8],['sl',107,1,9],['lc',17,11,19],['sl',92,1,4]],
  direcao: [['pv',3,5,6],['sl',32,8,8],['tg',1,5,6],['is',30,21,21],['sl',119,105,105],['jr',29,11,13],['rm',12,1,2],['sl',37,3,7],['pv',16,3,9],['jo',10,27,28],['is',58,11,11]],
  medo: [['is',41,10,13],['js',1,9,9],['sl',27,1,3],['2tm',1,7,7],['sl',91,1,6],['dt',31,6,8],['sl',56,3,4],['jo',14,27,27],['rm',8,31,39],['sl',118,6,7],['mc',4,35,41],['is',43,1,3]],
  crescer: [['2pe',1,3,8],['gl',5,22,25],['cl',3,12,14],['rm',12,9,21],['fp',3,12,14],['jo',15,1,8],['tg',1,2,4],['mt',5,13,16],['1co',13,1,7],['ef',4,1,6],['sl',1,1,3],['js',1,8,8]],
  culpa: [['1jo',1,8,9],['sl',51,1,12],['rm',8,1,2],['is',1,18,18],['sl',103,8,12],['lc',15,11,24],['mq',7,18,19],['2co',5,17,17],['sl',32,1,5],['hb',4,14,16],['jo',8,3,11]],
};

export type Suggestion = { bookIndex: number; abbrev: string; bookName: string; chapter: number; from: number; to: number; ref: string };

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function suggest(profile: Profile, mood: string, recent: Entry[], skip = 0): Suggestion {
  const list = BANK[mood] ?? BANK.crescer;
  const recentRefs = new Set(recent.slice(0, 20).map((e) => e.ref.split(' (')[0]));
  const start = hash(`${profile.name}|${profile.age}|${new Date().toDateString()}|${mood}`);
  const ordered = list.map((_, i) => list[(start + i) % list.length]);
  const fresh = ordered.filter(([a, c, f, t]) => !recentRefs.has(label(a, c, f, t)));
  const pool = fresh.length ? fresh : ordered;
  const [abbrev, chapter, from, to] = pool[skip % pool.length];
  const bookIndex = BOOKS.findIndex((b) => b.abbrev === abbrev);
  return { bookIndex, abbrev, bookName: BOOKS[bookIndex].name, chapter, from, to, ref: label(abbrev, chapter, from, to) };
}

function label(abbrev: string, c: number, f: number, t: number) {
  const name = BOOKS.find((b) => b.abbrev === abbrev)?.name ?? abbrev;
  return `${name} ${c}:${f === t ? f : `${f}-${t}`}`;
}

export const ALL_PASSAGES = BANK;
