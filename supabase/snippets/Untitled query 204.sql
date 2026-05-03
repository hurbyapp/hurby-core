-- ETAPA 14 | USO MÉDIO

create or replace function get_usage_avg()
returns table (dia date, media numeric)
language sql
as $$
  select 
    d.dia,
    (a.acessos::numeric / d.usuarios) as media
  from
    (select date(created_at) dia, count(distinct user_id) usuarios from user_login_events group by 1) d
  join
    (select date(created_at) dia, count(*) acessos from user_login_events group by 1) a
  on d.dia = a.dia
  order by d.dia desc;
$$;