-- 1. Função de garantia de salas (Ajustada para 1 MINUTO)
CREATE OR REPLACE FUNCTION ensure_active_rooms()
RETURNS VOID AS $$
DECLARE
    v_mod RECORD;
    v_open_count INTEGER;
    v_needed INTEGER;
BEGIN
    FOR v_mod IN SELECT id, max_participants FROM modules LOOP
        SELECT COUNT(*) INTO v_open_count 
        FROM rooms 
        WHERE module_id = v_mod.id AND (status = 'open' OR status = 'processing');
        
        v_needed := 3 - v_open_count;
        
        IF v_needed > 0 THEN
            FOR i IN 1..v_needed LOOP
                INSERT INTO rooms (module_id, max_participants, status, expires_at)
                VALUES (v_mod.id, v_mod.max_participants, 'open', NOW() + INTERVAL '1 minute');
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ajustando a função de sorteio para que a nova sala aberta também tenha 1 MINUTO
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
    v_platform_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    SELECT module_id, current_participants, max_participants INTO v_module_id, v_max_p FROM rooms WHERE id = p_room_id;
    SELECT price, max_participants INTO v_module_price, v_max_p FROM modules WHERE id = v_module_id;
    
    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333;

    UPDATE rooms SET status = 'processing' WHERE id = p_room_id;

    SELECT user_id INTO v_winner_1 FROM participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    IF v_winner_1 IS NULL THEN v_winner_1 := v_platform_user_id; END IF;
    IF v_winner_2 IS NULL THEN v_winner_2 := v_platform_user_id; END IF;

    INSERT INTO winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_platform_user_id, v_winner_2, v_prize_share, 3); -- Representação da taxa

    IF v_winner_1 != v_platform_user_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_1, 'VOCÊ GANHOU! 🎉', 'Parabéns! Você ganhou o 1º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    IF v_winner_2 != v_platform_user_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_2, 'VOCÊ GANHOU! 🥈', 'Parabéns! Você ganhou o 2º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    UPDATE rooms SET status = 'finished' WHERE id = p_room_id;

    -- ABRIR NOVA SALA COM 1 MINUTO PARA TESTE
    INSERT INTO rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '1 minute');

END;
$function$;

-- Executar para limpar e criar salas de 1 minuto
DELETE FROM rooms WHERE status = 'open';
SELECT ensure_active_rooms();