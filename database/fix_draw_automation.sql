-- 1. Reset de segurança para mesas travadas
UPDATE public.rooms SET status = 'open' WHERE status = 'processing';

-- 2. Função de Sorteio Definitiva
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
    -- Passo 1: Bloquear a mesa e pegar dados (Uso de FOR UPDATE para evitar concorrência)
    SELECT module_id, max_participants INTO v_module_id, v_max_p 
    FROM public.rooms 
    WHERE id = p_room_id AND status = 'open'
    FOR UPDATE;

    IF NOT FOUND THEN RETURN; END IF;

    -- Passo 2: Mudar status para processando
    UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

    -- Passo 3: Cálculos de Prêmios
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;
    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool / 3.0; -- Divisão exata por 3

    -- Passo 4: Selecionar Ganhadores Reais
    -- Winner 1
    SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    -- Winner 2 (Diferente do 1)
    SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Passo 5: Gravar os 3 Vencedores (O 3º é a Plataforma/Lucro)
    -- Se não houver participantes suficientes, a plataforma ganha as outras partes também
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, NULL, v_prize_share, 3); -- O ID NULL aqui representa o LUCRO DO SISTEMA

    -- Passo 6: Pagar Ganhadores Reais
    IF v_winner_1 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
    END IF;
    IF v_winner_2 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
    END IF;

    -- Passo 7: Finalizar e Criar Nova Mesa
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');
END;
$function$;