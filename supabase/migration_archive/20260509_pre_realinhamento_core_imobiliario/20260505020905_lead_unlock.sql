-- =========================================
-- LEAD UNLOCK SYSTEM
-- =========================================

create table public.lead_unlocks (
  id uuid primary key default gen_random_uuid(),

  lead_id uuid not null,
  user_id uuid not null,

  unlocked_at timestamptz default now(),
  lock_expires_at timestamptz not null,

  created_at timestamptz default now()
);

-- índice para performance
create index idx_lead_unlocks_lead on public.lead_unlocks (lead_id);
create index idx_lead_unlocks_user on public.lead_unlocks (user_id);

-- =========================================
-- FUNÇÃO: UNLOCK LEAD
-- =========================================

create or replace function public.unlock_lead(
  p_user_id uuid,
  p_lead_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_lock record;
  v_already_unlocked boolean;
begin

  -- 1. verifica se já desbloqueou antes
  select exists (
    select 1
    from public.lead_unlocks
    where lead_id = p_lead_id
    and user_id = p_user_id
  ) into v_already_unlocked;

  if v_already_unlocked then
    return;
  end if;

  -- 2. verifica lock atual
  select *
  into v_lock
  from public.lead_unlocks
  where lead_id = p_lead_id
  and lock_expires_at > now()
  order by lock_expires_at desc
  limit 1
  for update;

  if found then
    raise exception 'LEAD_LOCKED';
  end if;

  -- 3. consumir coin (40 AXE)
  perform public.consume_coin(
    p_user_id,
    40,
    'Unlock lead'
  );

  -- 4. criar unlock + lock 24h
  insert into public.lead_unlocks (
    lead_id,
    user_id,
    lock_expires_at
  )
  values (
    p_lead_id,
    p_user_id,
    now() + interval '24 hours'
  );

end;
$$;