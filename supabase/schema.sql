-- Run this in the Supabase SQL Editor

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_title text not null,
  domain text not null default 'כללי',
  segments jsonb not null,
  image_url text,
  youtube_query text,
  feedback text check (feedback in ('liked', 'disliked')),
  enjoyment smallint check (enjoyment between 1 and 5),
  created_at timestamptz not null default now()
);

create index if not exists lessons_user_id_created_at_idx
  on lessons (user_id, created_at desc);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.lessons to authenticated;

alter table lessons enable row level security;

create policy "Users can view own lessons"
  on lessons for select
  using (auth.uid() = user_id);

create policy "Users can insert own lessons"
  on lessons for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lessons"
  on lessons for update
  using (auth.uid() = user_id);
