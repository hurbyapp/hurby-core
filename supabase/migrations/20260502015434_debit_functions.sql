-- PASSO 3.10 — CORRIGIR CONTEXTO DE AUTH
-- Objetivo: garantir auth.uid() válido dentro da função
-- Resultado esperado: user_id preenchido corretamente
-- Próximo: rodar db reset

create or replace function public.add_credit(
  p_amount integer,
  p_origin text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into credit_transactions (
    user_id,
    amount,
    type,
    origin
  )
  values (
    auth.uid(),
    p_amount,
    'credit',
    p_origin
  );
end;
$$;