-- =========================================
-- MÓDULO: CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
-- MIGRATION: 20260509202000_fix_portfolios_insert_rls.sql
--
-- OBJETIVO:
-- Corrigir a policy de INSERT da tabela portfolios.
--
-- CONTEXTO:
-- O Core Imobiliário já foi criado e o frontend chegou
-- corretamente no banco, mas a RLS bloqueou a criação
-- automática da carteira individual do usuário.
--
-- REGRA:
-- Usuário autenticado pode criar somente portfolio
-- individual vinculado ao próprio auth.uid().
--
-- NÃO ALTERA:
-- - auth
-- - users_profile
-- - organizations
-- - memberships
-- - ledger
-- - wallet
-- - LGPD
-- - properties
-- - listings
-- =========================================

DROP POLICY IF EXISTS portfolios_insert_context
ON public.portfolios;

CREATE POLICY portfolios_insert_context
ON public.portfolios
FOR INSERT
TO authenticated
WITH CHECK (
  portfolio_type = 'individual'::public.portfolio_type_enum
  AND portfolio_status = 'active'::public.portfolio_status_enum
  AND profile_id = auth.uid()
  AND created_by_profile_id = auth.uid()
  AND organization_id IS NULL
  AND membership_id IS NULL
);

-- Mantém institutional fora do fluxo automático neste momento.
-- Carteiras institucionais serão tratadas em etapa específica
-- junto com agency/organization management.