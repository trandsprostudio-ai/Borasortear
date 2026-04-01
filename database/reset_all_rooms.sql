-- 1. Destravar mesas presas
UPDATE public.rooms 
SET status = 'open', current_participants = 0 
WHERE status IN ('processing', 'open');

-- 2. Limpar participantes de mesas que serão resetadas (apenas as não finalizadas)
DELETE FROM public.participants 
WHERE room_id IN (SELECT id FROM public.rooms WHERE status = 'open');

-- 3. Garantir que a função de sorteio seja robusta
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_module_id UUID;
    v_module_price DECIMAL;
    v_max_p INTEGER;
    v_total_pool DECIMAL;
    v_prize_share DECIMAL;
    v_winner_1 UUID;
    v_winner_2 UUID;
    v_platform_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Bloqueia a linha para evitar concorrência
    SELECT module_id, current_participants, max_participants INTO v_module_id, v_max_p 
    FROM public.rooms WHERE id = p_room_id FOR UPDATE;
    
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;
    
    IF v_module_id IS NULL THEN RETURN; END IF;

    -- Mudar status imediatamente
    UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333;

    -- Tentar encontrar ganhadores
    SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Fallback para conta da plataforma se não houver participantes suficientes
    IF v_winner_1 IS NULL THEN v_winner_1 := v_platform_id; END IF;
    IF v_winner_2 IS NULL THEN v_winner_2 := v_platform_id; END IF;

    -- Registrar vencedores
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, v_platform_id, v_prize_share, 3);

    -- Atualizar saldos
    IF v_winner_1 != v_platform_id THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
    END IF;
    IF v_winner_2 != v_platform_id THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
    END IF;

    -- Finalizar mesa
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

    -- Abrir nova mesa automaticamente
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');
END;
$function$;