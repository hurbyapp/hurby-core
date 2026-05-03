-- TOTAL DE LOGINS POR DIA
select 
  date(created_at) as dia,
  count(*) as acessos
from user_login_events
group by dia
order by dia desc;