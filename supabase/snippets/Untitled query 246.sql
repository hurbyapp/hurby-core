-- ETAPA 15.2 | DEBITO POR AÇÃO

create or replace function use_credit(
  p_amount integer,
  p_origin text
)
returns void
language plpgsql
security definer
as $$
declare
  v_user uuid;
begin

  v_user := auth.uid();

  if (select balance from user_wallet_balances where user_id = v_user) < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

  update user_wallet_balances
  set balance = balance - p_amount
  where user_id = v_user;

  insert into credit_transactions (
    user_id,
    type,
    amount,
    origin
  )
  values (
    v_user,
    'debit',
    p_amount,
    p_origin
  );

end;
$$;