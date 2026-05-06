-- PASSO 2 | Funções COIN | Esperado: motor financeiro ativo

create or replace function public.update_wallet_balance(p_user_id uuid)
returns void language plpgsql as $$
declare v_balance integer;
begin
  select coalesce(sum(
    case when transaction_type='CREDIT' then amount else -amount end
  ),0)
  into v_balance
  from public.wallet_ledger
  where user_id = p_user_id;

  insert into public.wallet_balance(user_id,balance)
  values(p_user_id,v_balance)
  on conflict(user_id)
  do update set balance=excluded.balance,updated_at=now();
end;
$$;

create or replace function public.add_coin(
  p_user_id uuid,
  p_amount integer,
  p_origin public.coin_origin_type,
  p_credit_type public.coin_credit_type,
  p_description text,
  p_expires_at timestamptz default null
)
returns void language plpgsql as $$
begin
  insert into public.wallet_ledger(
    user_id,transaction_type,origin_type,credit_type,
    amount,description,expires_at
  )
  values(
    p_user_id,'CREDIT',p_origin,p_credit_type,
    p_amount,p_description,p_expires_at
  );

  perform public.update_wallet_balance(p_user_id);
end;
$$;

create or replace function public.consume_coin(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
returns void language plpgsql as $$
declare v_remaining integer := p_amount; r record;
begin

  if (select balance from public.wallet_balance where user_id=p_user_id) < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  for r in
    select * from public.wallet_ledger
    where user_id=p_user_id
    and transaction_type='CREDIT'
    and (expires_at is null or expires_at>now())
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
      user_id,transaction_type,origin_type,credit_type,
      amount,description
    )
    values(
      p_user_id,'DEBIT','CONSUMPTION',r.credit_type,
      least(r.amount,v_remaining),p_description
    );

    v_remaining := v_remaining - r.amount;

  end loop;

  perform public.update_wallet_balance(p_user_id);
end;
$$;

create or replace function public.transfer_coin(
  p_from uuid,
  p_to uuid,
  p_amount integer
)
returns void language plpgsql as $$
begin

  if (select balance from public.wallet_balance where user_id=p_from) < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  insert into public.wallet_ledger values(
    gen_random_uuid(),p_from,'DEBIT','TRANSFER_OUT','PAID',
    p_amount,'Transferência enviada',null,null,now()
  );

  insert into public.wallet_ledger values(
    gen_random_uuid(),p_to,'CREDIT','TRANSFER_IN','TRANSFER',
    p_amount,'Transferência recebida',null,null,now()
  );

  perform public.update_wallet_balance(p_from);
  perform public.update_wallet_balance(p_to);
end;
$$;