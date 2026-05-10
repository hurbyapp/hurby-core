-- =========================================
-- MÓDULO: FINANCE / RLS FOUNDATION
-- MIGRATION: 20260505013435_coin_rls_full.sql
--
-- OBJETIVO:
-- Ativar RLS e políticas de proteção
-- das estruturas financeiras e operacionais
-- preservadas na foundation atual.
--
-- IMPORTANTE:
-- O bloco antigo de public.properties foi removido.
-- O bloco antigo de public.leads também foi removido
-- após realinhamento conceitual do Core Imobiliário.
--
-- MOTIVO:
-- - properties foi recriado em foundation própria
-- - leads será refeito futuramente como CORE_LEADS_V2
-- - evitar dependência de tabela legacy inexistente
-- - evitar quebra no db reset
--
-- FOUNDATION PRESERVADA:
-- - wallet
-- - wallet_ledger
-- - user_subscription
-- - users_profile
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
-- OBSERVAÇÃO
-- =========================================
--
-- CORE_PROPERTIES / CORE_PORTFOLIO:
-- possuem RLS próprios na migration:
-- 20260509190000_core_real_estate_operational_foundation.sql
--
-- CORE_LEADS:
-- será refeito futuramente como CORE_LEADS_V2.
--
-- Esta migration não deve criar nem proteger leads.
--
-- =========================================
