-- PASSO 5 | Auditoria básica | Esperado: rastreabilidade mínima

create table audit.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table audit.audit_logs enable row level security;

create policy audit_only_service
on audit.audit_logs
for all
to service_role
using (true)
with check (true);