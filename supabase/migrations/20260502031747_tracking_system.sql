-- ETAPA 7 — TABELA DE TRACKING DE LOGIN
-- Objetivo: registrar eventos de uso do sistema
-- Resultado: dados para analytics e dashboard do dono

create table public.user_login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  user_type text default 'unknown',
  created_at timestamp with time zone default now()
);

-- índice para performance
create index idx_login_user on user_login_events(user_id);
create index idx_login_created on user_login_events(created_at);

-- RLS
alter table user_login_events enable row level security;

-- usuário só vê os próprios dados
create policy "select own login events"
on user_login_events
for select
using (auth.uid() = user_id);

-- permitir insert autenticado
create policy "insert own login events"
on user_login_events
for insert
with check (auth.uid() = user_id);