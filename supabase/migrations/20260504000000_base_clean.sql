-- =========================================================
-- HURBY — BASE CLEAN
-- Migration: 20260504000000_base_clean.sql
-- Status: Foundation técnica neutra
-- 
-- NOTA DE IDENTIFICAÇÃO:
-- Esta migration cria apenas a base técnica mínima do ecossistema.
-- Não define tipo de usuário, perfil comercial, corretor, agência,
-- cliente, assinatura ou plano.
--
-- Decisão arquitetural:
-- - user_type_enum foi removido da foundation ativa
-- - account_tier_enum foi removido da foundation ativa
-- - identidade operacional será tratada em users_profile neutro
-- - papéis profissionais/clientes serão tratados em cores próprios
--
-- Contrato preservado:
-- auth.users.id = users_profile.id
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create schema if not exists audit;
create schema if not exists private;

-- Função utilitária genérica para updated_at.
-- Pode ser reutilizada por tabelas futuras sem acoplar regra de negócio.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
