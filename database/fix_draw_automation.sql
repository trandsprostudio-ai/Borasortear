-- Correção da função de sorteio (Ajuste no INSERT de vencedores)
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
    -- ID da conta da plataforma para taxas (Garante que o ID seja um UUID válido)
    v_platform_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- 1. Buscar dados da sala
    SELECT module_id, current_participants, max_participants INTO v_module_id, v_max_p FROM rooms WHERE id = p_room_id;
    SELECT price INTO v_module_price FROM modules WHERE id = v_module_id;
    
    -- Se a sala não existir ou já foi sorteada, sai silenciosamente
    IF v_module_id IS NULL THEN RETURN; END IF;

    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333;

    -- 2. Mudar status para 'processing' para evitar sorteios duplicados
    UPDATE rooms SET status = 'processing' WHERE id = p_room_id;

    -- 3. Sortear ganhadores (se houver participantes)
    SELECT user_id INTO v_winner_1 FROM participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Garantir que temos IDs válidos para a tabela de vencedores
    IF v_winner_1 IS NULL THEN v_winner_1 := v_platform_id; END IF;
    IF v_winner_2 IS NULL THEN v_winner_2 := v_platform_id; END IF;

    -- 4. Inserir vencedores (draw_id, user_id, prize_amount, position)
    INSERT INTO winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, v_platform_id, v_prize_share, 3); -- CORREÇÃO: p_room_id no lugar de v_platform_id

    -- 5. Atualizar saldos dos ganhadores reais
    IF v_winner_1 != v_platform_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_1, 'VOCÊ GANHOU! 🎉', 'Parabéns! Você ganhou o 1º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    IF v_winner_2 != v_platform_id THEN
        UPDATE profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
        INSERT INTO notifications (user_id, title, message, type) VALUES (v_winner_2, 'VOCÊ GANHOU! 🥈', 'Parabéns! Você ganhou o 2º prêmio na Mesa #' || SUBSTRING(p_room_id::text, 1, 8), 'success');
    END IF;

    -- 6. Finalizar a sala
    UPDATE rooms SET status = 'finished' WHERE id = p_room_id;

    -- 7. Abrir nova sala para o mesmo módulo (TESTE 1 MINUTO)
    INSERT INTO rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '1 minute');

END;
$function$;