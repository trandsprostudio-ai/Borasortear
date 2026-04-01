-- 1. Atualizar os limites na tabela de módulos
UPDATE public.modules SET max_participants = 100 WHERE name = 'M100';
UPDATE public.modules SET max_participants = 50 WHERE name = 'M200';
UPDATE public.modules SET max_participants = 20 WHERE name = 'M500';
UPDATE public.modules SET max_participants = 10 WHERE name = 'M1000';
UPDATE public.modules SET max_participants = 5 WHERE name = 'M2000';
UPDATE public.modules SET max_participants = 2 WHERE name = 'M5000';

-- 2. Atualizar as salas abertas para os novos limites (para não ficarem com o limite antigo)
UPDATE public.rooms r
SET max_participants = m.max_participants
FROM public.modules m
WHERE r.module_id = m.id AND r.status = 'open';

-- 3. Caso alguma sala já tenha mais participantes que o novo limite, forçar sorteio
-- (Isto evita que mesas fiquem 'travadas' com excesso de jogadores)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.rooms WHERE current_participants >= max_participants AND status = 'open'
    LOOP
        PERFORM public.perform_automatic_draw(r.id);
    END LOOP;
END $$;