insert into users_profile (id, name, user_type)
values (
  '3f78ce4c-8ca0-4273-9fa8-d8778a9e2328',
  'Teste',
  'broker'
)
on conflict (id) do update
set user_type = 'broker';