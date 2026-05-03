-- ETAPA 14 | NOVOS USUÁRIOS

create or replace function get_new_users()
returns table (dia date, novos bigint)
language sql
as $$
  select 
    date(created_at),
    count(*)
  from auth.users
  group by 1
  order by 1 desc;
$$;