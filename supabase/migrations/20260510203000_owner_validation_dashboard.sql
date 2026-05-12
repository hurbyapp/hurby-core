-- =========================================
-- MODULO: OWNER_VALIDATION_DASHBOARD
-- CONTEXTO: Owner temporario de validacao
-- LOCAL: supabase/migrations/20260510203000_owner_validation_dashboard.sql
--
-- DESCRICAO:
-- Cria RPCs temporarias para validar ambiente Owner antes do Core Owner/Admin definitivo.
--
-- REGRAS:
-- - Owner temporario = users_profile.primary_entry_flow = 'platform_owner'
-- - Nao representa Core Owner definitivo
-- - Reaproveita add_coin para distribuir AXE
-- - Lista usuarios, saldos e imoveis para validacao
--
-- BACKLOG:
-- Futuramente substituir por Core Owner/Admin real com:
-- - permissoes administrativas formais
-- - auditoria completa
-- - trilha financeira
-- - governanca
-- - logs
-- - papeis administrativos dedicados
-- =========================================

create or replace function public.is_platform_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile up
    where up.id = auth.uid()
      and up.account_status = 'active'
      and up.primary_entry_flow = 'platform_owner'
  );
$$;

create or replace function public.owner_validation_users()
returns table (
  profile_id uuid,
  display_name text,
  email text,
  primary_entry_flow text,
  registration_status text,
  account_status text,
  property_count bigint,
  axe_balance integer
)
language sql
security definer
set search_path = public
as $$
  select
    up.id as profile_id,
    up.display_name,
    up.email,
    up.primary_entry_flow,
    up.registration_status,
    up.account_status,
    coalesce((
      select count(*)
      from public.property_listings pl
      where pl.created_by_profile_id = up.id
        and pl.deleted_at is null
    ), 0)::bigint as property_count,
    coalesce(wb.balance, 0)::integer as axe_balance
  from public.users_profile up
  left join public.wallet_balance wb
    on wb.user_id = up.id
  where public.is_platform_owner()
  order by up.created_at desc;
$$;

create or replace function public.owner_validation_properties()
returns table (
  listing_id uuid,
  title text,
  price numeric,
  created_by_profile_id uuid,
  created_by_email text,
  created_by_name text,
  visibility_scope text,
  source text,
  origin_label text,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    pl.id as listing_id,
    pl.title,
    pl.price,
    pl.created_by_profile_id,
    up.email as created_by_email,
    up.display_name as created_by_name,
    pl.visibility_scope::text as visibility_scope,
    pl.metadata->>'source' as source,
    case
      when pl.metadata->>'source' = 'marketplace_user_listing'
        then 'Cad. MP'
      else 'Operacional'
    end as origin_label,
    pl.created_at
  from public.property_listings pl
  left join public.users_profile up
    on up.id = pl.created_by_profile_id
  where public.is_platform_owner()
    and pl.deleted_at is null
  order by pl.created_at desc;
$$;

create or replace function public.owner_add_axe(
  p_user_id uuid,
  p_amount integer,
  p_description text default 'Credito Owner temporario'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_owner() then
    raise exception 'OWNER_ACCESS_REQUIRED';
  end if;

  if p_user_id is null then
    raise exception 'USER_REQUIRED';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  perform public.add_coin(
    p_user_id,
    p_amount,
    'ADMIN',
    'BONUS',
    coalesce(nullif(trim(p_description), ''), 'Credito Owner temporario'),
    null
  );

  return jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'amount', p_amount
  );
end;
$$;
