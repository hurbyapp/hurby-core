-- RLS

alter table users_profile enable row level security;

create policy "select own profile"
on users_profile
for select
using (auth.uid() = id);

create policy "insert own profile"
on users_profile
for insert
with check (auth.uid() = id);