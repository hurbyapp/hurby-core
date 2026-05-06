-- PASSO 2 | Tabela de perfil de usuário | Esperado: vincular auth.users com regras de negócio

create table public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  user_type public.user_type_enum not null,
  account_tier public.account_tier_enum not null,
  agency_id uuid,
  terms_version_accepted text,
  terms_accepted_at timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);

alter table public.users_profile enable row level security;

-- SELECT próprio perfil
create policy users_profile_select
on public.users_profile
for select
to authenticated
using (auth.uid() = id);

-- UPDATE próprio perfil
create policy users_profile_update
on public.users_profile
for update
to authenticated
using (auth.uid() = id);