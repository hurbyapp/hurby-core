-- =========================================
-- HURBY
-- SEED FOUNDATION
--
-- OBJETIVO:
-- dados iniciais oficiais
-- do sistema.
--
-- IMPORTANTE:
-- seeds devem conter apenas:
-- - dados estruturais
-- - catálogos
-- - defaults globais
--
-- PROIBIDO:
-- - dados fake operacionais
-- - usuários fake
-- - propriedades fake
-- =========================================

-- =========================================
-- PROPERTY STATUS
-- =========================================

INSERT INTO public.property_status (name)
VALUES
    ('draft'),
    ('active'),
    ('paused'),
    ('negotiating'),
    ('sold')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- PROPERTY TYPE
-- =========================================

INSERT INTO public.property_type (name)
VALUES
    ('apartment'),
    ('house'),
    ('land'),
    ('commercial')
ON CONFLICT (name) DO NOTHING;