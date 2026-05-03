-- RANKING COM NOME

drop function if exists get_user_ranking();

create function get_user_ranking()
returns table (name text, acessos bigint)
language sql
as $$
  select 
    p.name,
    count(e.*)
  from user_login_events e
  join users_profile p on p.id = e.user_id
  group by p.name
  order by count(e.*) desc;
$$;