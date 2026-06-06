-- Run this if you already created the lessons table but get
-- "permission denied for table lessons" errors.

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.lessons to authenticated;
