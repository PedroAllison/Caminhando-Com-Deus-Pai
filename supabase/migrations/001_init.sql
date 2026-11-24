-- Caminhando com Deus Pai - esquema inicial
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  age int,
  gender text check (gender in ('M','F')),
  streak int not null default 0,
  best int not null default 0,
  last_date date,
  friend_code text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_at timestamptz default now()
);

create table if not exists public.friendships (
  user_id uuid references public.profiles on delete cascade,
  friend_id uuid references public.profiles on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, friend_id)
);

create table if not exists public.shared_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  ref text not null,
  note text not null check (char_length(note) <= 2000),
  created_at timestamptz default now()
);

create table if not exists public.amens (
  post_id uuid references public.shared_reflections on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  primary key (post_id, user_id)
);

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.shared_reflections enable row level security;
alter table public.amens enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own friendships" on public.friendships for select using (user_id = auth.uid());
create policy "insert own posts" on public.shared_reflections for insert with check (user_id = auth.uid());
create policy "read own/friends posts" on public.shared_reflections for select using (
  user_id = auth.uid() or exists (select 1 from public.friendships f where f.user_id = auth.uid() and f.friend_id = shared_reflections.user_id));
create policy "own amens" on public.amens for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- adiciona amizade (mútua) a partir do código
create or replace function public.add_friend(code text) returns void
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  select id into fid from profiles where friend_code = upper(code);
  if fid is null then raise exception 'Código não encontrado'; end if;
  if fid = auth.uid() then raise exception 'Esse é o seu próprio código'; end if;
  insert into friendships values (auth.uid(), fid, now()) on conflict do nothing;
  insert into friendships values (fid, auth.uid(), now()) on conflict do nothing;
end $$;

create or replace function public.list_friends()
returns table (id uuid, name text, streak int, last_date date, friend_code text)
language sql security definer set search_path = public as $$
  select p.id, p.name,
    case when p.last_date >= current_date - 1 then p.streak else 0 end,
    p.last_date, p.friend_code
  from friendships f join profiles p on p.id = f.friend_id
  where f.user_id = auth.uid()
  order by p.last_date desc nulls last;
$$;

create or replace function public.friends_feed()
returns table (id uuid, user_id uuid, name text, ref text, note text, created_at timestamptz, amens bigint)
language sql security definer set search_path = public as $$
  select r.id, r.user_id, p.name, r.ref, r.note, r.created_at,
    (select count(*) from amens a where a.post_id = r.id)
  from shared_reflections r join profiles p on p.id = r.user_id
  where r.user_id = auth.uid()
     or r.user_id in (select friend_id from friendships where user_id = auth.uid())
  order by r.created_at desc limit 50;
$$;
