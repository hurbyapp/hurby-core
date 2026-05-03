-- PASSO 3.13 — FUNÇÃO DE CRÉDITO (INVOKER)
-- Objetivo: usar contexto do usuário logado (auth.uid)
-- Resultado esperado: user_id preenchido
-- Próximo: db reset

create or replace function public.add_credit(
  p_amount integer,
  p_origin text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  insert into credit_transactions (
    user_id,
    amount,
    type,
    origin
  )
  values (
    v_user_id,
    p_amount,
    'credit',
    p_origin
  );
end;
$$;

grant execute on function public.add_credit(integer, text) to authenticated;