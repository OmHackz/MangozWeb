-- MangoZ SMP — Supabase / Postgres schema (free tier compatible)
-- Run in Supabase SQL editor. Requires pgcrypto for gen_random_uuid().

create extension if not exists "pgcrypto";

-- Players: public read, service-role write
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  uuid text unique not null,
  username text not null,
  online boolean not null default false,
  first_joined timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  playtime integer not null default 0 check (playtime >= 0),
  money integer not null default 0 check (money >= 0),
  kills integer not null default 0 check (kills >= 0),
  deaths integer not null default 0 check (deaths >= 0),
  blocks_broken integer not null default 0 check (blocks_broken >= 0),
  blocks_placed integer not null default 0 check (blocks_placed >= 0)
);
create index if not exists players_username_idx on players (username);
create index if not exists players_online_idx on players (online);
create index if not exists players_playtime_idx on players (playtime desc);
create index if not exists players_money_idx on players (money desc);

-- Server status (single row id=1)
create table if not exists server (
  id integer primary key,
  name text not null default 'MangoZ SMP',
  version text not null default '26.1.2',
  online boolean not null default true,
  players_online integer not null default 0,
  players_max integer not null default 100,
  java_address text not null default 'play.mangoz-smp.pages.dev',
  bedrock_address text not null default 'play.mangoz-smp.pages.dev',
  bedrock_port text not null default '19132',
  java_online boolean not null default true,
  bedrock_online boolean not null default true,
  motd text,
  updated_at timestamptz not null default now()
);
insert into server (id) values (1) on conflict (id) do nothing;

-- Aggregate stats (single row id=1, optional — site can compute from players)
create table if not exists server_stats (
  id integer primary key,
  total_players integer not null default 0,
  total_playtime bigint not null default 0,
  total_kills bigint not null default 0,
  total_deaths bigint not null default 0,
  total_money bigint not null default 0,
  total_blocks_broken bigint not null default 0,
  total_blocks_placed bigint not null default 0,
  uptime_percent numeric not null default 99.0,
  updated_at timestamptz not null default now()
);
insert into server_stats (id) values (1) on conflict (id) do nothing;

-- Sessions (optional history)
create table if not exists player_sessions (
  id uuid primary key default gen_random_uuid(),
  player_uuid text not null,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  duration integer
);
create index if not exists player_sessions_uuid_idx on player_sessions (player_uuid);

-- Row Level Security: public read-only, writes via service role only
alter table players enable row level security;
alter table server enable row level security;
alter table server_stats enable row level security;
alter table player_sessions enable row level security;

drop policy if exists "public read players" on players;
create policy "public read players" on players for select using (true);

drop policy if exists "public read server" on server;
create policy "public read server" on server for select using (true);

drop policy if exists "public read stats" on server_stats;
create policy "public read stats" on server_stats for select using (true);

drop policy if exists "no public sessions" on player_sessions;
create policy "no public sessions" on player_sessions for select using (false);
-- No insert/update/delete policies for anon => only service_role can write.
