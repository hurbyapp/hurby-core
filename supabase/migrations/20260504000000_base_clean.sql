-- =========================================
-- MÓDULO: CORE_BASE
-- CONTEXTO: BASE CLEAN FOUNDATION
-- LOCAL: supabase/migrations/20260504000000_base_clean.sql
--
-- DESCRIÇÃO:
-- Cria a base mínima institucional do Hurby.
--
-- O QUE ALTERA:
-- - extensões
-- - schemas
-- - enums base de identidade
--
-- O QUE NÃO ALTERAR:
-- - não criar vínculos organizacionais aqui
-- - não criar agencies aqui
-- - não criar memberships aqui
--
-- DEPENDÊNCIAS:
-- - PostgreSQL
-- - Supabase
-- =========================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create schema if not exists public;
create schema if not exists audit;
create schema if not exists private;

-- =========================================
-- USER TYPE ENUM
-- =========================================
--
-- IMPORTANTE:
-- user_type representa identidade operacional base.
--
-- NÃO representa:
-- - vínculo com agência
-- - membership
-- - organização
-- - contexto institucional
--
-- Agency NÃO é user_type.
-- Agency é organização/contexto operacional.
-- =========================================

create type public.user_type_enum as enum (
  'owner',
  'broker',
  'user'
);

-- =========================================
-- ACCOUNT TIER ENUM
-- =========================================

create type public.account_tier_enum as enum (
  'SUBSCRIPTION',
  'PAY_PER_USE'
);