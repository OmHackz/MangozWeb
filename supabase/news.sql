-- MangoZ SMP announcements — run AFTER supabase/schema.sql
-- Optional: without this table the inbox falls back to built-in news.

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists announcements_created_idx on announcements (created_at desc);

alter table announcements enable row level security;

drop policy if exists "public read announcements" on announcements;
create policy "public read announcements" on announcements for select using (true);
-- Writes via service_role (Supabase dashboard) only.
