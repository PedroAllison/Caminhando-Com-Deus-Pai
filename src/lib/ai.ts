// Chama a Edge Function "devocional" (Supabase), que usa o Google Gemini (plano gratuito).
// A chave da IA fica só no servidor. Sem Supabase configurado, usa um texto de reserva.
import { hasSupabase, supabase } from './supabase';
import type { Profile, Entry } from './storage';

type ReflectIn = { profile: Profile; ref: string; verseText: string; chapterText: string; recent: Entry[] };

async function call(body: object): Promise<string> {
  if (!hasSupabase) throw new Error('offline');
  const { data, error } = await supabase.functions.invoke('devocional', { body });
  if (error) throw error;
  return data.text as string;
}

export async function generateReflection(i: ReflectIn): Promise<string> {
  try {
    return await call({
      action: 'reflect', name: i.profile.name, age: i.profile.age, gender: i.profile.gender,
      ref: i.ref, verse: i.verseText, chapter: i.chapterText.slice(0, 6000),
      recentRefs: i.recent.slice(0, 5).map((e) => e.ref),
    });
  } catch {
    return `${i.profile.name}, pare um instante e leia de novo: "${i.verseText}" (${i.ref}).\n\n` +
      'Deus fala com você hoje por meio desta palavra. Pergunte a si mesmo: o que este texto revela sobre o caráter de Deus? ' +
      'Que promessa ou orientação existe aqui para o seu dia?\n\nOração: Senhor, abre meus olhos para ver a Tua verdade e me dá força para vivê-la hoje. Amém.';
  }
}

export async function respondToNote(profile: Profile, ref: string, reflection: string, note: string) {
  try {
    return await call({ action: 'respond', name: profile.name, age: profile.age, gender: profile.gender, ref, reflection, note });
  } catch {
    return `Que bom que você registrou isso, ${profile.name}. Guarde essa palavra no coração ao longo do dia — ` +
      'Deus continua a obra que começou em você (Fp 1:6).';
  }
}
