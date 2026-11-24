import AsyncStorage from '@react-native-async-storage/async-storage';

export type Gender = 'M' | 'F';
export type Profile = { name: string; age: number; gender: Gender; version: string; reminders: string[] };
export type Entry = {
  date: string; ref: string; verseText: string; reflection: string; note: string; response: string;
};
export type Stats = { streak: number; best: number; lastDate: string | null; total: number };

const K = { profile: 'cdp.profile', entries: 'cdp.entries', stats: 'cdp.stats' };

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b + 'T12:00').getTime() - new Date(a + 'T12:00').getTime()) / 86400000);

async function get<T>(k: string, fb: T): Promise<T> {
  try { const v = await AsyncStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
}
const set = (k: string, v: unknown) => AsyncStorage.setItem(k, JSON.stringify(v));

export const getProfile = () => get<Profile | null>(K.profile, null);
export const saveProfile = (p: Profile) => set(K.profile, p);
export const getEntries = () => get<Entry[]>(K.entries, []);

export async function getStats(): Promise<Stats> {
  const s = await get<Stats>(K.stats, { streak: 0, best: 0, lastDate: null, total: 0 });
  // se pulou mais de um dia, a lamparina apagou
  if (s.lastDate && dayDiff(s.lastDate, today()) > 1) s.streak = 0;
  return s;
}
export const litToday = (s: Stats) => s.lastDate === today();

export async function completeDevotional(e: Entry): Promise<Stats> {
  const entries = await getEntries();
  await set(K.entries, [e, ...entries].slice(0, 365));
  const s = await getStats();
  if (s.lastDate !== today()) {
    s.streak = s.lastDate && dayDiff(s.lastDate, today()) === 1 ? s.streak + 1 : 1;
    s.lastDate = today();
    s.total += 1;
    s.best = Math.max(s.best, s.streak);
    await set(K.stats, s);
  }
  return s;
}
