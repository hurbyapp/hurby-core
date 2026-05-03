-- ETAPA 11.5.1 | RESET DA FUNÇÃO DE RANKING

drop function if exists get_user_ranking();

create function get_user_ranking()
returns table (email text, acessos bigint)
language sql
as $$
  select 
    u.email,
    count(e.*)
  from user_login_events e
  join auth.users u on u.id = e.user_id
  group by u.email
  order by count(e.*) desc;
$$;