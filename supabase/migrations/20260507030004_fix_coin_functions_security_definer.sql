-- =========================================
-- HURBY
-- FIX | SECURITY DEFINER FINANCIAL FUNCTIONS
-- LOCAL:
-- supabase/migrations/20260507030004_fix_coin_functions_security_definer.sql
--
-- OBJETIVO:
-- corrigir funções financeiras para:
-- - bypass interno de RLS
-- - estabilidade wallet
-- - estabilidade RPC cloud
-- - compatibilidade Vercel
-- - evitar bloqueios em wallet_balance
--
-- -----------------------------------------
--
-- PROBLEMA IDENTIFICADO
--
-- [2026-05-07]
--
-- Erro:
--
-- new row violates row-level security policy
-- for table "wallet_balance"
--
-- CAUSA:
--
-- funções financeiras estavam como:
-- SECURITY INVOKER (padrão PostgreSQL)
--
-- RESULTADO:
--
-- RLS bloqueava:
-- - insert
-- - update
-- - refresh wallet
--
-- -----------------------------------------
--
-- CORREÇÃO IMPLEMENTADA
--
-- ✔ SECURITY DEFINER
-- ✔ search_path protegido
-- ✔ bypass interno RLS
-- ✔ estabilidade financeira
-- ✔ compatibilidade Supabase Cloud
--
-- -----------------------------------------
--
-- IMPORTANTE
--
-- Tipos ENUM removidos dos parâmetros
-- para evitar inconsistências históricas
-- do banco cloud staging.
--
-- =========================================

create or replace function public.update_wallet_balance(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin

  select coalesce(
    sum(
      case
        when transaction_type='CREDIT'
        then amount
        else -amount
      end
    ),
    0
  )
  into v_balance
  from public.wallet_ledger
  where user_id = p_user_id;

  insert into public.wallet_balance(
    user_id,
    balance
  )
  values(
    p_user_id,
    v_balance
  )
  on conflict(user_id)
  do update set
    balance = excluded.balance,
    updated_at = now();

end;
$$;

create or replace function public.add_coin(
  p_user_id uuid,
  p_amount integer,
  p_origin text,
  p_credit_type text,
  p_description text,
  p_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.wallet_ledger(
    user_id,
    transaction_type,
    origin_type,
    credit_type,
    amount,
    description,
    expires_at
  )
  values(
    p_user_id,
    'CREDIT',
    p_origin,
    p_credit_type,
    p_amount,
    p_description,
    p_expires_at
  );

  perform public.update_wallet_balance(
    p_user_id
  );

end;
$$;

create or replace function public.consume_coin(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_remaining integer := p_amount;
  r record;
begin

  if (
    select balance
    from public.wallet_balance
    where user_id = p_user_id
  ) < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  for r in
    select *
    from public.wallet_ledger
    where user_id = p_user_id
      and transaction_type = 'CREDIT'
      and (
        expires_at is null
        or expires_at > now()
      )
    order by
      case credit_type
        when 'BONUS' then 1
        when 'REWARD' then 2
        when 'PAID' then 3
        else 4
      end,
      created_at
  loop

    exit when v_remaining <= 0;

    insert into public.wallet_ledger(
      user_id,
      transaction_type,
      origin_type,
      credit_type,
      amount,
      description
    )
    values(
      p_user_id,
      'DEBIT',
      'CONSUMPTION',
      r.credit_type,
      least(r.amount, v_remaining),
      p_description
    );

    v_remaining :=
      v_remaining - r.amount;

  end loop;

  perform public.update_wallet_balance(
    p_user_id
  );

end;
$$;

create or replace function public.transfer_coin(
  p_from uuid,
  p_to uuid,
  p_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin

  if (
    select balance
    from public.wallet_balance
    where user_id = p_from
  ) < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  insert into public.wallet_ledger
  values(
    gen_random_uuid(),
    p_from,
    'DEBIT',
    'TRANSFER_OUT',
    'PAID',
    p_amount,
    'Transferência enviada',
    null,
    null,
    now()
  );

  insert into public.wallet_ledger
  values(
    gen_random_uuid(),
    p_to,
    'CREDIT',
    'TRANSFER_IN',
    'TRANSFER',
    p_amount,
    'Transferência recebida',
    null,
    null,
    now()
  );

  perform public.update_wallet_balance(
    p_from
  );

  perform public.update_wallet_balance(
    p_to
  );

end;
$$;