-- ETAPA 11.6 | FUNÇÃO DE RANKING COM NOME

drop function if exists get_user_ranking();

create function get_user_ranking()
returns table (name text, acessos bigint)
language sql
as $$
  select 
    coalesce(p.name, 'Sem nome') as name,
    count(e.*) as acessos
  from user_login_events e
  left join users_profile p on p.id = e.user_id
  group by name
  order by acessos desc;
$$;