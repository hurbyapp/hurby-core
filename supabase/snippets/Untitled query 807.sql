-- RANKING DE USUÁRIOS
select 
  user_id,
  count(*) as acessos
from user_login_events
group by user_id
order by acessos desc;