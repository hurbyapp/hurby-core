-- ETAPA 11.6 | PERFIL DE USUÁRIO

create table public.users_profile (
  id uuid primary key references auth.users(id),
  name text,
  user_type text,
  created_at timestamp with time zone default now()
);