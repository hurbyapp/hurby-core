-- =========================================
-- FUNÇÃO: GET LEAD STATUS
-- =========================================

create or replace function public.get_lead_status(
  p_user_id uuid,
  p_lead_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_already_unlocked boolean;
  v_lock record;
  v_seconds_left integer;
begin

  -- 1. já desbloqueou?
  select exists (
    select 1
    from public.lead_unlocks
    where lead_id = p_lead_id
      and user_id = p_user_id
  ) into v_already_unlocked;

  -- 2. lock atual
  select *
  into v_lock
  from public.lead_unlocks
  where lead_id = p_lead_id
    and lock_expires_at > now()
  order by lock_expires_at desc
  limit 1;

  -- 3. tempo restante
  if v_lock.lock_expires_at is not null then
    v_seconds_left := extract(epoch from (v_lock.lock_expires_at - now()));
  else
    v_seconds_left := 0;
  end if;

  -- 4. retorno
  return json_build_object(
    'already_unlocked', v_already_unlocked,
    'is_locked', (v_lock.id is not null),
    'seconds_left', greatest(v_seconds_left, 0),
    'can_unlock',
      case
        when v_already_unlocked then false
        when v_lock.id is not null then false
        else true
      end
  );

end;
$$;