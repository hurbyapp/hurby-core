-- PASSO 1 | Base limpa inicial | Esperado: estrutura mínima consistente sem legado

-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- SCHEMAS
create schema if not exists public;
create schema if not exists audit;
create schema if not exists private;

-- USER TYPE ENUM
create type public.user_type_enum as enum (
  'owner',
  'broker',
  'agency',
  'user'
);

-- ACCOUNT TIER
create type public.account_tier_enum as enum (
  'SUBSCRIPTION',
  'PAY_PER_USE'
);