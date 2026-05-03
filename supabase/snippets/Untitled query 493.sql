-- ETAPA 15.1 | ADMIN ADD CREDIT

create or replace function admin_add_credit(
  p_user_id uuid,
  p_amount integer,
  p_origin text
)
returns void
language plpgsql
security definer
as $$
begin

  update user_wallet_balances
  set balance = balance + p_amount
  where user_id = p_user_id;

  insert into credit_transactions (
    user_id,
    type,
    amount,
    origin
  )
  values (
    p_user_id,
    'credit',
    p_amount,
    p_origin
  );

end;
$$;