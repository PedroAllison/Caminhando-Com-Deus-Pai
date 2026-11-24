// Texto bíblico embutido no app (NVI), sem depender de internet.
import { BOOKS } from './books';
import { NVI_BOOKS } from './nvi-index';

export const VERSIONS = [{ id: 'nvi', label: 'NVI - Nova Versão Internacional' }];
export type Verse = { number: number; text: string };
export type Chapter = { bookName: string; chapter: number; version: string; verses: Verse[] };

export async function fetchChapter(version: string, abbrev: string, chapter: number): Promise<Chapter> {
  const idx = BOOKS.findIndex((b) => b.abbrev === abbrev);
  if (idx < 0) throw new Error('Livro não encontrado.');
  const chapters = NVI_BOOKS[idx]();
  const verses = (chapters[chapter - 1] ?? []).map((text, i) => ({ number: i + 1, text }));
  if (!verses.length) throw new Error('Capítulo não encontrado.');
  return { bookName: BOOKS[idx].name, chapter, version: 'nvi', verses };
}
