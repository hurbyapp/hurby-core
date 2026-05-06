-- PASSO 5 | Compra

create or replace function public.purchase_coin(
  p_user_id uuid,
  p_amount integer
)
returns void language plpgsql as $$
begin

  perform public.add_coin(
    p_user_id,p_amount,'PURCHASE','PAID','Compra de COIN'
  );

end;
$$;