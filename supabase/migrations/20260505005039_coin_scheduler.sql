-- PASSO 4 | Scheduler

create extension if not exists pg_cron;

select cron.schedule(
  'coin-expiration',
  '0 2 * * *',
  $$ select public.expire_coin(); $$
);