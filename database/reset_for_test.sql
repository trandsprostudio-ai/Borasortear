-- 1. Limpar dados de teste anteriores
DELETE FROM public.winners;
DELETE FROM public.participants;
DELETE FROM public.rooms;

-- 2. Recriar mesas padrão (3 para cada módulo) com 30 segundos de duração
DO $$
DECLARE
    v_mod RECORD;
BEGIN
    FOR v_mod IN SELECT id, max_participants FROM public.modules LOOP
        -- Criar 3 salas para cada módulo
        FOR i IN 1..3 LOOP
            INSERT INTO public.rooms (module_id, max_participants, status, expires_at, created_at)
            VALUES (v_mod.id, v_mod.max_participants, 'open', NOW() + INTERVAL '30 seconds', NOW());
        END LOOP;
    END LOOP;
END $$;