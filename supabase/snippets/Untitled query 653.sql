-- ETAPA 18.3 | GET USER TYPE

create or replace function get_user_type()
returns text
language sql
as $$
  select user_type
  from users_profile
  where id = auth.uid();
$$;