-- 1. Destravar mesas que estão presas agora
UPDATE public.rooms SET status = 'open' WHERE status = 'processing';

-- 2. Função de Sorteio Robusta com Tratamento de Erros
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
    BEGIN
        -- Bloqueia a linha para evitar concorrência
        SELECT module_id, current_participants, max_participants INTO v_module_id, v_max_p 
        FROM public.rooms WHERE id = p_room_id FOR UPDATE;
        
        IF v_module_id IS NULL THEN RETURN; END IF;

        -- Busca preço do módulo
        SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;

        -- Muda status para processando
        UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

        v_total_pool := v_module_price * v_max_p;
        v_prize_share := v_total_pool * 0.3333;

        -- Seleciona ganhadores aleatórios (quem participou ganha, quem não participou a plataforma leva)
        SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
        SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

        -- Fallback se não houver participantes
        IF v_winner_1 IS NULL THEN v_winner_1 := v_platform_id; END IF;
        IF v_winner_2 IS NULL THEN v_winner_2 := v_platform_id; END IF;

        -- Registrar vencedores
        INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
        (p_room_id, v_winner_1, v_prize_share, 1),
        (p_room_id, v_winner_2, v_prize_share, 2),
        (p_room_id, v_platform_id, v_prize_share, 3);

        -- Atualizar saldos dos ganhadores reais
        IF v_winner_1 != v_platform_id THEN
            UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_1;
        END IF;
        IF v_winner_2 != v_platform_id THEN
            UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_2;
        END IF;

        -- Finaliza a mesa com sucesso
        UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

        -- Abre nova mesa para este módulo
        INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
        VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');

    EXCEPTION WHEN OTHERS THEN
        -- SE DER ERRO: Volta a mesa para 'open' e estende o tempo em 10 minutos
        UPDATE public.rooms 
        SET status = 'open', 
            expires_at = NOW() + INTERVAL '10 minutes' 
        WHERE id = p_room_id;
        RAISE NOTICE 'Erro no sorteio da mesa %: %', p_room_id, SQLERRM;
    END;
END;
$function$;