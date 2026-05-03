-- USUÁRIOS ÚNICOS POR DIA
select 
  date(created_at) as dia,
  count(distinct user_id) as usuarios_unicos
from user_login_events
group by dia
order by dia desc;