import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const hasSupabase = !!url && !!key;

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

export async function ensureSession() {
  if (!hasSupabase) return null;
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const { data: d, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return d.session;
}
