-- ETAPA 11.5 | RANKING COM EMAIL

create or replace function get_user_ranking()
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