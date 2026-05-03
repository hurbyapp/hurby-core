-- ETAPA 15.7 | SALDO REAL

create or replace function get_user_balance(p_user_id uuid)
returns integer
language sql
as $$
  select coalesce(
    sum(
      case 
        when type = 'credit' then amount
        when type = 'debit' then -amount
      end
    ), 0
  )
  from credit_transactions
  where user_id = p_user_id;
$$;