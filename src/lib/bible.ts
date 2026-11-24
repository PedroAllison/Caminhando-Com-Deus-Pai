// Texto bíblico via ABibliaDigital (versões licenciadas disponíveis na API).
// NAA, ARC e NVT não são oferecidas pela API: para incluí-las é preciso licença da SBB/Mundo Cristão.
export const VERSIONS = [
  { id: 'nvi', label: 'NVI - Nova Versão Internacional' },
  { id: 'ra', label: 'ARA - Almeida Revista e Atualizada' },
  { id: 'acf', label: 'ACF - Almeida Corrigida Fiel' },
  { id: 'apee', label: 'APEE - A Palavra em Português' },
];
export type Verse = { number: number; text: string };
export type Chapter = { bookName: string; chapter: number; version: string; verses: Verse[] };

const BASE = 'https://www.abibliadigital.com.br/api';
const token = process.env.EXPO_PUBLIC_BIBLIA_TOKEN;

export async function fetchChapter(version: string, abbrev: string, chapter: number): Promise<Chapter> {
  const res = await fetch(`${BASE}/verses/${version}/${encodeURIComponent(abbrev)}/${chapter}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Não foi possível carregar o capítulo. Verifique sua conexão.');
  const j = await res.json();
  return { bookName: j.book?.name ?? abbrev, chapter, version, verses: j.verses ?? [] };
}
