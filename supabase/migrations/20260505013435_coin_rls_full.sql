-- =========================================
-- ATIVAR RLS
-- =========================================

alter table public.wallet_ledger enable row level security;
alter table public.wallet_balance enable row level security;
alter table public.user_subscription enable row level security;
alter table public.users_profile enable row level security;
alter table public.leads enable row level security;
alter table public.properties enable row level security;

-- =========================================
-- WALLET_LEDGER
-- =========================================

create policy "ledger_select_own"
on public.wallet_ledger
for select
using (auth.uid() = user_id);

create policy "ledger_block_insert"
on public.wallet_ledger
for insert
with check (false);

create policy "ledger_block_update"
on public.wallet_ledger
for update
using (false);

create policy "ledger_block_delete"
on public.wallet_ledger
for delete
using (false);

-- =========================================
-- WALLET_BALANCE
-- =========================================

create policy "balance_select_own"
on public.wallet_balance
for select
using (auth.uid() = user_id);

create policy "balance_block_all"
on public.wallet_balance
for all
using (false);

-- =========================================
-- USER_SUBSCRIPTION
-- =========================================

create policy "subscription_select_own"
on public.user_subscription
for select
using (auth.uid() = user_id);

create policy "subscription_block_all"
on public.user_subscription
for all
using (false);

-- =========================================
-- USERS_PROFILE
-- =========================================

-- já existia, mas vamos garantir

create policy "profile_select_own"
on public.users_profile
for select
using (auth.uid() = id);

create policy "profile_update_own"
on public.users_profile
for update
using (auth.uid() = id);

-- bloquear delete

create policy "profile_block_delete"
on public.users_profile
for delete
using (false);

-- =========================================
-- LEADS
-- =========================================

-- usuário vê apenas leads atribuídos a ele

create policy "leads_select_own"
on public.leads
for select
using (assigned_to_agent_id = auth.uid());

-- bloquear escrita direta (vai via função depois)

create policy "leads_block_insert"
on public.leads
for insert
with check (false);

create policy "leads_block_update"
on public.leads
for update
using (false);

create policy "leads_block_delete"
on public.leads
for delete
using (false);

-- =========================================
-- PROPERTIES
-- =========================================

-- usuário vê apenas seus imóveis

create policy "properties_select_own"
on public.properties
for select
using (owner_id = auth.uid());

-- bloquear escrita direta

create policy "properties_block_insert"
on public.properties
for insert
with check (false);

create policy "properties_block_update"
on public.properties
for update
using (false);

create policy "properties_block_delete"
on public.properties
for delete
using (false);

-- =========================================
-- OBSERVAÇÃO CRÍTICA
-- =========================================

-- Funções continuam funcionando normalmente
-- porque executam com privilégio do banco (security definer se necessário)
