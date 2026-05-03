-- ETAPA 14.5 | NOVOS USUÁRIOS (CORRIGIDO)

drop function if exists get_new_users();

create function get_new_users()
returns table (dia date, novos bigint)
language sql
as $$
  select 
    date(created_at) as dia,
    count(*) as novos
  from auth.users
  where created_at is not null
  group by dia
  order by dia desc;
$$;