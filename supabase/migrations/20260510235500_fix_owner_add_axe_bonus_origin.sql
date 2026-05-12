/*
=========================================
HURBY - FIX OWNER ADD AXE BONUS ORIGIN
LOCAL:
supabase/migrations/20260510235500_fix_owner_add_axe_bonus_origin.sql

STATUS:
OWNER_VALIDATION_AXE_FIX

OBJETIVO:
Corrigir a RPC temporaria owner_add_axe para usar valores reais dos enums
coin_origin_type e coin_credit_type.

CONTEXTO:
O Owner temporario de validacao distribui AXE para usuarios durante testes.
Essa distribuicao nao representa compra real, nem transferencia entre carteiras.
Portanto, deve ser registrada como BONUS/BONUS no ledger.

IMPORTANTE:
Nao representa Core Owner/Admin definitivo.
Nao altera a arquitetura financeira definitiva.
Nao cria saldo direto fora do ledger.

CORRECAO TECNICA:
A funcao antiga usava origem ADMIN, valor inexistente no enum coin_origin_type.
Como o tipo de retorno anterior pode ser diferente, a funcao precisa ser removida
e recriada com a assinatura correta.
=========================================
*/

drop function if exists public.owner_add_axe(uuid, integer, text);

create function public.owner_add_axe(
  p_user_id uuid,
  p_amount integer,
  p_description text default 'Credito Owner temporario'
)
returns void
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

  if not exists (
    select 1
    from public.users_profile up
    where up.id = p_user_id
      and up.account_status = 'active'
  ) then
    raise exception 'TARGET_USER_NOT_FOUND_OR_INACTIVE';
  end if;

  perform public.add_coin(
    p_user_id,
    p_amount,
    'BONUS'::public.coin_origin_type,
    'BONUS'::public.coin_credit_type,
    coalesce(p_description, 'Credito Owner temporario'),
    null::timestamp with time zone
  );
end;
$$;
