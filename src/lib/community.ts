import { hasSupabase, supabase, ensureSession } from './supabase';
import type { Profile, Stats } from './storage';

export type Friend = { id: string; name: string; streak: number; last_date: string | null; friend_code: string };
export type SharedPost = { id: string; user_id: string; name: string; ref: string; note: string; created_at: string; amens: number };

export async function syncProfile(p: Profile, s: Stats) {
  if (!hasSupabase) return null;
  const session = await ensureSession();
  if (!session) return null;
  const { data } = await supabase.from('profiles').upsert({
    id: session.user.id, name: p.name, age: p.age, gender: p.gender,
    streak: s.streak, best: s.best, last_date: s.lastDate,
  }).select('friend_code').single();
  return data?.friend_code as string | undefined;
}

export async function addFriend(code: string) {
  const { error } = await supabase.rpc('add_friend', { code: code.trim().toUpperCase() });
  if (error) throw new Error(error.message);
}

export async function listFriends(): Promise<Friend[]> {
  const { data, error } = await supabase.rpc('list_friends');
  if (error) throw error;
  return data ?? [];
}

export async function shareReflection(ref: string, note: string) {
  const session = await ensureSession();
  if (!session) return;
  await supabase.from('shared_reflections').insert({ user_id: session.user.id, ref, note });
}

export async function feed(): Promise<SharedPost[]> {
  const { data, error } = await supabase.rpc('friends_feed');
  if (error) throw error;
  return data ?? [];
}

export async function amen(postId: string) {
  const session = await ensureSession();
  if (!session) return;
  await supabase.from('amens').upsert({ post_id: postId, user_id: session.user.id });
}
