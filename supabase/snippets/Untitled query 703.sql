-- ETAPA 11 | FUNÇÃO 1 | USUÁRIOS ÚNICOS

create or replace function get_daily_unique_users()
returns table (dia date, usuarios_unicos bigint)
language sql
as $$
  select 
    date(created_at) as dia,
    count(distinct user_id)
  from user_login_events
  group by dia
  order by dia desc;
$$;