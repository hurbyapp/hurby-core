-- PASSO 3 | Expiração + Assinatura

create or replace function public.is_user_subscribed(p_user_id uuid)
returns boolean language sql as $$
  select exists(
    select 1 from public.user_subscription
    where user_id=p_user_id and is_active=true
    and (expires_at is null or expires_at>now())
  );
$$;

create or replace function public.expire_coin()
returns void language plpgsql as $$
declare r record;
begin

  for r in
    select * from public.wallet_ledger
    where credit_type='BONUS'
    and expires_at is not null
    and expires_at<=now()
  loop

    if public.is_user_subscribed(r.user_id) then continue; end if;

    insert into public.wallet_ledger(
      user_id,transaction_type,origin_type,credit_type,amount,description
    )
    values(
      r.user_id,'DEBIT','EXPIRATION','BONUS',r.amount,'Expiração'
    );

    perform public.update_wallet_balance(r.user_id);

  end loop;

end;
$$;

create or replace function public.activate_subscription(p_user_id uuid)
returns void language plpgsql as $$
begin

  update public.user_subscription set is_active=false where user_id=p_user_id;

  insert into public.user_subscription(
    user_id,is_active,started_at,expires_at
  )
  values(
    p_user_id,true,now(),now()+interval '30 days'
  );

  perform public.add_coin(
    p_user_id,100,'REWARD','PAID','Assinatura',now()+interval '60 days'
  );

end;
$$;