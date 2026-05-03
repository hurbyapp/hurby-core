-- ETAPA 15.7 | USE CREDIT (CORRIGIDO)

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
  v_balance integer;
begin

  v_user := auth.uid();

  select get_user_balance(v_user) into v_balance;

  if v_balance < p_amount then
    raise exception 'Saldo insuficiente';
  end if;

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