-- ENABLE RLS
alter table public.credit_transactions enable row level security;

-- POLICY INSERT
create policy "insert_own_transactions"
on public.credit_transactions
for insert
to authenticated
with check (auth.uid() = user_id);

-- POLICY SELECT
create policy "select_own_transactions"
on public.credit_transactions
for select
to authenticated
using (auth.uid() = user_id);