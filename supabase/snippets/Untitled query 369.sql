create or replace function get_user_type()
returns text
language sql
as $$
  select coalesce(
    (select user_type from users_profile where id = auth.uid()),
    'broker'
  );
$$;