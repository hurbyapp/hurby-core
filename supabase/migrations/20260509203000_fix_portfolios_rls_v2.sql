-- =========================================
-- MÓDULO: CORE_REAL_ESTATE_OPERATIONAL_FOUNDATION
-- MIGRATION: 20260509203000_fix_portfolios_rls_v2.sql
--
-- OBJETIVO:
-- Corrigir definitivamente a RLS de portfolios
-- para permitir criação e leitura imediata da
-- carteira individual do usuário autenticado.
--
-- MOTIVO:
-- O fluxo client-side usa:
-- insert(...).select().single()
--
-- Portanto o usuário precisa:
-- 1. poder inserir a própria carteira individual
-- 2. poder ler a carteira recém-criada
--
-- NÃO ALTERA:
-- - auth
-- - users_profile
-- - ledger
-- - wallet
-- - LGPD
-- - organizations
-- - memberships
-- - properties
-- =========================================

DROP POLICY IF EXISTS portfolios_select_context
ON public.portfolios;

DROP POLICY IF EXISTS portfolios_insert_context
ON public.portfolios;

DROP POLICY IF EXISTS portfolios_update_context
ON public.portfolios;

DROP POLICY IF EXISTS portfolios_delete_context
ON public.portfolios;

-- =========================================
-- SELECT
-- =========================================

CREATE POLICY portfolios_select_context
ON public.portfolios
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
  OR created_by_profile_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = portfolios.organization_id
      AND om.profile_id = auth.uid()
      AND om.membership_status = 'active'
  )
);

-- =========================================
-- INSERT
-- =========================================

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

-- =========================================
-- UPDATE
-- =========================================

CREATE POLICY portfolios_update_context
ON public.portfolios
FOR UPDATE
TO authenticated
USING (
  profile_id = auth.uid()
  OR created_by_profile_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = portfolios.organization_id
      AND om.profile_id = auth.uid()
      AND om.membership_status = 'active'
      AND om.membership_role IN ('owner', 'manager')
  )
)
WITH CHECK (
  profile_id = auth.uid()
  OR created_by_profile_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.organization_memberships om
    WHERE om.organization_id = portfolios.organization_id
      AND om.profile_id = auth.uid()
      AND om.membership_status = 'active'
      AND om.membership_role IN ('owner', 'manager')
  )
);

-- =========================================
-- DELETE
-- =========================================

CREATE POLICY portfolios_delete_context
ON public.portfolios
FOR DELETE
TO authenticated
USING (
  profile_id = auth.uid()
  OR created_by_profile_id = auth.uid()
);