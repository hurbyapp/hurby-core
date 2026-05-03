-- ETAPA 14 | DAU

create or replace function get_dau()
returns table (dia date, usuarios bigint)
language sql
as $$
  select 
    date(created_at),
    count(distinct user_id)
  from user_login_events
  group by 1
  order by 1 desc;
$$;