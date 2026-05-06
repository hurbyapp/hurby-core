-- =========================================
-- AUTO CREATE PROFILE ON AUTH USER
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users_profile (
    id,
    name,
    user_type,
    account_tier,
    status
  )
  values (
    new.id,
    coalesce(new.email, 'Usuario'),
    'broker',
    'PAY_PER_USE',
    'active'
  );

  return new;
end;
$$;

-- remove trigger antigo se existir
drop trigger if exists on_auth_user_created on auth.users;

-- cria trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();