-- ETAPA 18.1 | PERFIL DE USUÁRIO

alter table users_profile
add column if not exists user_type text;

-- valores:
-- 'owner'
-- 'agency'
-- 'broker'

alter table users_profile
add column if not exists agency_id uuid;