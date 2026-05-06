-- PASSO 1 | Estrutura COIN | Esperado: base financeira criada

-- ENUMS

create type public.coin_transaction_type as enum ('CREDIT','DEBIT');

create type public.coin_origin_type as enum (
  'PURCHASE',
  'BONUS',
  'REWARD',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'CONSUMPTION',
  'REFUND',
  'EXPIRATION'
);

create type public.coin_credit_type as enum (
  'PAID',
  'BONUS',
  'REWARD',
  'TRANSFER'
);

-- LEDGER

create table public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,

  transaction_type public.coin_transaction_type not null,
  origin_type public.coin_origin_type not null,
  credit_type public.coin_credit_type not null,

  amount integer not null check (amount > 0),

  description text,
  reference_id uuid,

  expires_at timestamptz,
  created_at timestamptz default now()
);

create index idx_wallet_user on public.wallet_ledger(user_id);

-- BALANCE CACHE

create table public.wallet_balance (
  user_id uuid primary key,
  balance integer default 0,
  updated_at timestamptz default now()
);

-- SUBSCRIPTION

create table public.user_subscription (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  is_active boolean default false,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- PRICING

create table public.coin_pricing (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  price integer,
  is_active boolean default true
);

-- CAMPAIGNS

create table public.coin_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text,
  bonus_amount integer,
  expires_in_days integer,
  is_active boolean default true
);