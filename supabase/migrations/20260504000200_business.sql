-- PASSO 3 | Estrutura inicial de negócio | Esperado: base para leads e propriedades

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  assigned_to_agent_id uuid,
  lead_status text default 'new'
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  owner_id uuid
);