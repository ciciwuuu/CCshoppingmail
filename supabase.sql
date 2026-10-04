-- Run this entire file in Supabase SQL Editor.
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  category text not null check (category in ('Jewelry','Beauty')),
  description text default '',
  image_url text default '',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Public visitors can read active products.
create policy "public read active products"
on public.products for select
using (active = true);

-- Authenticated admin users can manage products.
create policy "authenticated manage products"
on public.products for all
to authenticated
using (true)
with check (true);

-- Customers can create orders anonymously.
create policy "public create orders"
on public.orders for insert
to anon, authenticated
with check (true);

-- Only authenticated admins can read/update orders.
create policy "authenticated manage orders"
on public.orders for select
to authenticated
using (true);

create policy "authenticated update orders"
on public.orders for update
to authenticated
using (true)
with check (true);

insert into public.products (name,price,category,description) values
('Lumière Pearl Studs',38,'Jewelry','Minimal freshwater pearl earrings.'),
('Sculpted Gold Ring',46,'Jewelry','A polished everyday statement ring.'),
('Silk Glow Lip Oil',24,'Beauty','Lightweight shine with a soft finish.'),
('Soft Veil Blush',29,'Beauty','Buildable color for an effortless look.'),
('Celeste Pendant',52,'Jewelry','A delicate everyday pendant.')
on conflict do nothing;