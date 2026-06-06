create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age smallint check (age between 8 and 120),
  preferred_topic text not null default 'random',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.profiles to authenticated;
