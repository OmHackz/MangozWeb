-- MangoZ SMP AFK bot status — run AFTER supabase/schema.sql

-- Single row (id=1) written by POST /api/bot/status
create table if not exists bot_status (
  id integer primary key,
  online boolean not null default false,
  uptime_seconds bigint not null default 0,
  account text,
  version text,
  latency_ms integer,
  updated_at timestamptz not null default now()
);
insert into bot_status (id) values (1) on conflict (id) do nothing;

-- Migration from the older Discord-style shape (safe to re-run):
alter table bot_status drop column if exists guilds;
alter table bot_status drop column if exists users;
alter table bot_status add column if not exists account text;

alter table bot_status enable row level security;

drop policy if exists "public read bot status" on bot_status;
create policy "public read bot status" on bot_status for select using (true);
-- No insert/update/delete policies for anon => only service_role can write.
