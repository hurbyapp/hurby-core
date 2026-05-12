-- =========================================
-- MÓDULO: CORE_ORGANIZATIONS_INITIAL_OWNER_RLS
-- CONTEXTO: Agency Signup / Initial Owner Membership
-- LOCAL: supabase/migrations/20260510144500_fix_initial_agency_owner_rls.sql
--
-- DESCRIÇÃO:
-- Corrige o fluxo inicial de cadastro de imobiliária.
--
-- PROBLEMA:
-- A organization era criada pelo usuário autenticado,
-- mas a policy de SELECT em organizations dependia de membership ativo.
-- Como o membership inicial ainda não existia, o INSERT em
-- organization_memberships podia falhar ao validar a organização criada.
--
-- O QUE ALTERA:
-- - adiciona policy para permitir que o criador visualize a organização criada
-- - preserva a policy existente baseada em membership ativo
--
-- O QUE NÃO ALTERAR:
-- - não altera tabelas
-- - não altera enums
-- - não altera fluxo de clients
-- - não altera fluxo de broker
-- - não altera Core Properties
--
-- DEPENDÊNCIAS:
-- - public.organizations
-- - public.organization_memberships
-- - auth.uid()
-- =========================================

drop policy if exists organizations_select_created_by_profile
on public.organizations;

create policy organizations_select_created_by_profile
on public.organizations
for select
to authenticated
using (
  created_by_profile_id = auth.uid()
);
