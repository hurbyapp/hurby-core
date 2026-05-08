-- =========================================
-- MÓDULO: FINANCE / RLS FOUNDATION
-- MIGRATION: 20260505013435_coin_rls_full.sql
--
-- OBJETIVO:
-- ativar RLS e políticas de proteção
-- das estruturas financeiras e operacionais.
--
-- IMPORTANTE:
-- o bloco antigo de public.properties
-- foi removido desta migration.
--
-- MOTIVO:
-- properties deixou de ser placeholder
-- e passou a pertencer oficialmente ao:
--
-- CORE_PROPERTIES FOUNDATION
--
-- migration oficial:
-- 20260506235139_core_properties_foundation.sql
--
-- FOUNDATION PRESERVADA:
-- - wallet
-- - wallet_ledger
-- - finance
-- - auth
-- - LGPD
-- =========================================

-- =========================================
-- ATIVAR RLS
-- =========================================

ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.wallet_balance ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =========================================
-- WALLET_LEDGER
-- =========================================

CREATE POLICY "ledger_select_own"
ON public.wallet_ledger
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "ledger_block_insert"
ON public.wallet_ledger
FOR INSERT
WITH CHECK (false);

CREATE POLICY "ledger_block_update"
ON public.wallet_ledger
FOR UPDATE
USING (false);

CREATE POLICY "ledger_block_delete"
ON public.wallet_ledger
FOR DELETE
USING (false);

-- =========================================
-- WALLET_BALANCE
-- =========================================

CREATE POLICY "balance_select_own"
ON public.wallet_balance
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "balance_block_all"
ON public.wallet_balance
FOR ALL
USING (false);

-- =========================================
-- USER_SUBSCRIPTION
-- =========================================

CREATE POLICY "subscription_select_own"
ON public.user_subscription
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "subscription_block_all"
ON public.user_subscription
FOR ALL
USING (false);

-- =========================================
-- USERS_PROFILE
-- =========================================

CREATE POLICY "profile_select_own"
ON public.users_profile
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profile_update_own"
ON public.users_profile
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "profile_block_delete"
ON public.users_profile
FOR DELETE
USING (false);

-- =========================================
-- LEADS
-- =========================================

CREATE POLICY "leads_select_own"
ON public.leads
FOR SELECT
USING (assigned_to_agent_id = auth.uid());

CREATE POLICY "leads_block_insert"
ON public.leads
FOR INSERT
WITH CHECK (false);

CREATE POLICY "leads_block_update"
ON public.leads
FOR UPDATE
USING (false);

CREATE POLICY "leads_block_delete"
ON public.leads
FOR DELETE
USING (false);

-- =========================================
-- OBSERVAÇÃO
-- =========================================

-- CORE_PROPERTIES possui:
-- - RLS próprio
-- - policies próprias
-- - ownership próprio
--
-- migration:
-- 20260506235139_core_properties_foundation.sql