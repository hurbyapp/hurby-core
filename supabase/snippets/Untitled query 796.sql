-- ETAPA 11 | FUNÇÃO 3 | RANKING

create or replace function get_user_ranking()
returns table (user_id uuid, acessos bigint)
language sql
as $$
  select 
    user_id,
    count(*)
  from user_login_events
  group by user_id
  order by count(*) desc;
$$;