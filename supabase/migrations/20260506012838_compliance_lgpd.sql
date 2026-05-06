-- =========================================
-- HURBY — LGPD / COMPLIANCE LAYER
-- SAFE MIGRATION (NO CORE IMPACT)
-- =========================================

-- =========================
-- 1. AUDIT LOGS
-- =========================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

-- =========================
-- 2. CONSENT LOGS
-- =========================
create table if not exists public.consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  consent_type text not null,
  version text not null,
  accepted boolean not null default true,
  ip text,
  user_agent text,
  created_at timestamptz default now()
);

-- =========================
-- 3. RLS
-- =========================

-- AUDIT
alter table public.audit_logs enable row level security;

create policy "audit_insert"
on public.audit_logs
for insert
to authenticated
with check (true);

create policy "audit_select_own"
on public.audit_logs
for select
to authenticated
using (auth.uid() = user_id);

-- CONSENT
alter table public.consent_logs enable row level security;

create policy "consent_insert"
on public.consent_logs
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "consent_select_own"
on public.consent_logs
for select
to authenticated
using (auth.uid() = user_id);

-- =========================
-- 4. FUNCTIONS (SECURE)
-- =========================

create or replace function public.log_action(
  p_action text,
  p_entity text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.audit_logs (
    user_id,
    action,
    entity,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    p_action,
    p_entity,
    p_entity_id,
    p_metadata
  );
end;
$$;

create or replace function public.register_consent(
  p_type text,
  p_version text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.consent_logs (
    user_id,
    consent_type,
    version
  )
  values (
    auth.uid(),
    p_type,
    p_version
  );
end;
$$;