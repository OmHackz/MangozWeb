-- MangoZ SMP bot status — run AFTER supabase/schema.sql

-- Single row (id=1) written by POST /api/bot/status
create table if not exists bot_status (
  id integer primary key,
  online boolean not null default false,
  uptime_seconds bigint not null default 0,
  version text,
  guilds integer not null default 0,
  users integer not null default 0,
  latency_ms integer,
  updated_at timestamptz not null default now()
);
insert into bot_status (id) values (1) on conflict (id) do nothing;

alter table bot_status enable row level security;

drop policy if exists "public read bot status" on bot_status;
create policy "public read bot status" on bot_status for select using (true);
-- No insert/update/delete policies for anon => only service_role can write.
