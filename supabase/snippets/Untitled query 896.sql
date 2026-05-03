-- ETAPA 15.7 | ADMIN ADD CREDIT (CORRIGIDO)

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