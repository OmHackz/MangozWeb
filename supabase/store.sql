-- MangoZ SMP store — run AFTER supabase/schema.sql

create extension if not exists "pgcrypto";

-- Store orders: players can INSERT their own purchase claims.
-- Staff verify payments manually (Supabase dashboard) and flip status.
create table if not exists store_orders (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  item_id text not null,
  item_name text not null,
  amount_inr numeric(10, 2) not null check (amount_inr >= 0),
  upi_id text not null,
  utr text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  verified_at timestamptz
);
create index if not exists store_orders_username_idx on store_orders (username);
create index if not exists store_orders_status_idx on store_orders (status);
create index if not exists store_orders_created_idx on store_orders (created_at desc);

alter table store_orders enable row level security;

-- Anyone may submit an order, but order history is staff-only
-- (buyers track their own orders from the receipt + inbox).
drop policy if exists "public insert orders" on store_orders;
create policy "public insert orders" on store_orders for insert with check (true);
-- No select/update/delete policies for anon => only service_role can read/verify.
