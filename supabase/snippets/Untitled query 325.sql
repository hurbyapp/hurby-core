-- HORÁRIO COM MAIS ACESSOS
select 
  extract(hour from created_at) as hora,
  count(*) as acessos
from user_login_events
group by hora
order by acessos desc;