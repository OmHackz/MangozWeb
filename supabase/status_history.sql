-- MangoZ SMP status history — run AFTER supabase/schema.sql
-- One row per server/bot report. Powers the last-N-hours status graphs.

create table if not exists status_heartbeats (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('server', 'bot')),
  online boolean not null,
  players_online integer,
  created_at timestamptz not null default now()
);
create index if not exists status_heartbeats_service_time_idx
  on status_heartbeats (service, created_at desc);

alter table status_heartbeats enable row level security;

drop policy if exists "public read heartbeats" on status_heartbeats;
create policy "public read heartbeats" on status_heartbeats for select using (true);
-- No insert/delete policies for anon => only service_role can write/prune.
