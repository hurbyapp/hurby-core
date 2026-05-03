-- ETAPA 16 | EXTRATO 30 DIAS

create or replace function get_user_statement(p_user_id uuid)
returns table (
  created_at timestamp,
  type text,
  amount integer,
  origin text
)
language sql
as $$
  select 
    created_at,
    type,
    amount,
    origin
  from credit_transactions
  where user_id = p_user_id
    and created_at >= now() - interval '30 days'
  order by created_at desc;
$$;