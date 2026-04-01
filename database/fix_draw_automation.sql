-- 1. Função para selecionar vencedores reais e garantir automação
CREATE OR REPLACE FUNCTION perform_automatic_draw(p_room_id UUID)
RETURNS VOID AS $$
DECLARE
    v_module_id UUID;
    v_module_price DECIMAL;
    v_max_p INTEGER;
    v_total_pool DECIMAL;
    v_prize_share DECIMAL;
    v_winner_1 UUID;
    v_winner_2 UUID;
    v_platform_user_id UUID := '00000000-0000-0000-0000-000000000000'; -- ID simbólico para a plataforma
BEGIN
    -- Obter dados da sala e módulo
    SELECT module_id, current_participants, max_participants INTO v_module_id, v_max_p FROM rooms WHERE id = p_room_id;
    SELECT price, max_participants INTO v_module_price, v_max_p FROM modules WHERE id = v_module_id;
    
    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333; -- 33.3% para cada posição

    -- Marcar como processando para evitar duplicidade
    UPDATE rooms SET status = 'processing' WHERE id = p_room_id;

    -- Selecionar 1º Vencedor (Aleatório entre participantes reais)
    SELECT user_id INTO v_winner_1 FROM participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    
    -- Selecionar 2º Vencedor (Aleatório, excluindo o 1º)
    SELECT user_id INTO v_winner_2 FROM participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Se não houver 1º vencedor (sala vazia), a plataforma ganha tudo
    IF v_winner_1 IS NULL THEN v_winner_1 := v_platform_user_id; END IF;
    
    -- Se não houver 2º vencedor (só 1 pessoa na sala), a plataforma ganha o 2º lugar
    IF v_winner_2 IS NULL THEN v_winner_2 := v_platform_user_id; END IF;

    -- Registrar Vencedores
    INSERT INTO winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, v_platform_user_id, v_prize_share, 3); -- Taxa da plataforma

    -- Pagar vencedores reais instantaneamente
    IF v_winner_1 != v_platform_user_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_1, 'VOCÊ GANHOU! 🎉', 'Parabéns! Você ganhou o 1º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    IF v_winner_2 != v_platform_user_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_2, 'VOCÊ GANHOU! 🥈', 'Parabéns! Você ganhou o 2º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    -- Finalizar sala
    UPDATE rooms SET status = 'finished' WHERE id = p_room_id;

    -- ABRIR NOVA SALA IMEDIATAMENTE (O "Pulo do Gato" para não ficar sincronizando)
    INSERT INTO rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;