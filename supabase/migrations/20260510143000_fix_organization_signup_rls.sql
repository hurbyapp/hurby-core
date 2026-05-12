-- =========================================
-- MÓDULO: CORE_ORGANIZATIONS_SIGNUP_RLS
-- CONTEXTO: CORE_IDENTITY + CORE_CLIENTS + ORGANIZATIONS
-- LOCAL: supabase/migrations/20260510143000_fix_organization_signup_rls.sql
--
-- DESCRIÇÃO:
-- Permite que um usuário autenticado crie uma organização própria
-- e crie seu vínculo inicial como owner ativo.
--
-- O QUE ALTERA:
-- - adiciona policy de insert em organizations
-- - adiciona policy de update básico em organizations para owner/manager ativo
-- - adiciona policy de insert em organization_memberships para criador da organização
--
-- O QUE NÃO ALTERAR:
-- - não altera estrutura das tabelas
-- - não altera enums
-- - não altera lógica de memberships existente
-- - não altera Core Clients
--
-- DEPENDÊNCIAS:
-- - public.organizations
-- - public.organization_memberships
-- - public.users_profile
-- =========================================

drop policy if exists organizations_insert_own
on public.organizations;

create policy organizations_insert_own
on public.organizations
for insert
to authenticated
with check (
  created_by_profile_id = auth.uid()
);

drop policy if exists organizations_update_by_owner_manager
on public.organizations;

create policy organizations_update_by_owner_manager
on public.organizations
for update
to authenticated
using (
  exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = organizations.id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
      and om.membership_role in ('owner', 'manager')
  )
)
with check (
  exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = organizations.id
      and om.profile_id = auth.uid()
      and om.membership_status = 'active'
      and om.membership_role in ('owner', 'manager')
  )
);

drop policy if exists organization_memberships_insert_initial_owner
on public.organization_memberships;

create policy organization_memberships_insert_initial_owner
on public.organization_memberships
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and membership_role = 'owner'
  and membership_status = 'active'
  and exists (
    select 1
    from public.organizations o
    where o.id = organization_memberships.organization_id
      and o.created_by_profile_id = auth.uid()
  )
);
