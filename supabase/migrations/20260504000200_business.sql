-- =========================================
-- MÓDULO: BUSINESS FOUNDATION
-- MIGRATION: 20260504000200_business.sql
-- CONTEXTO:
-- foundation inicial de negócio
--
-- OBJETIVO:
-- criar estruturas mínimas operacionais
-- relacionadas ao fluxo comercial.
--
-- ESCOPO ATUAL:
-- - leads
--
-- IMPORTANTE:
-- a tabela properties foi removida desta
-- migration por ter sido promovida para:
--
-- CORE_PROPERTIES FOUNDATION
--
-- migration oficial:
-- 20260506235139_core_properties_foundation.sql
--
-- MOTIVO:
-- evitar:
-- - duplicidade estrutural
-- - conflito de migrations
-- - divergência arquitetural
-- - regressão de schema
--
-- FOUNDATION PRESERVADA:
-- - auth
-- - wallet
-- - ledger
-- - LGPD
-- - RLS
-- =========================================

CREATE TABLE public.leads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at timestamptz DEFAULT now(),

    assigned_to_agent_id uuid,

    lead_status text DEFAULT 'new'
);