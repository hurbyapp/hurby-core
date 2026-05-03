-- ETAPA 11 | FUNÇÃO 2 | ACESSOS

create or replace function get_daily_access()
returns table (dia date, acessos bigint)
language sql
as $$
  select 
    date(created_at),
    count(*)
  from user_login_events
  group by 1
  order by 1 desc;
$$;