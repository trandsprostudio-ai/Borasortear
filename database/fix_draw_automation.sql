-- 1. Destravar mesas presas
UPDATE public.rooms SET status = 'open' WHERE status = 'processing';

-- 2. Função de Sorteio Corrigida
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
BEGIN
    -- Bloqueia a mesa
    UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id AND status = 'open';
    IF NOT FOUND THEN RETURN; END IF;

    -- Busca dados
    SELECT module_id, max_participants INTO v_module_id, v_max_p FROM public.rooms WHERE id = p_room_id;
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;

    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333;

    -- Seleciona 2 ganhadores reais
    SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Registrar os 3 lugares (Plataforma é NULL no user_id)
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, NULL, v_prize_share, 3); -- NULL = PLATAFORMA

    -- Atualizar saldos dos ganhadores reais (se existirem)
    IF v_winner_1 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
    END IF;
    IF v_winner_2 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
    END IF;

    -- Finaliza
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

    -- Nova mesa
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');
END;
$function$;