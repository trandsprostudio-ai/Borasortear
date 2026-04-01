-- 1. LIMPEZA TOTAL (Apaga o fluxo antigo que travava)
DROP TRIGGER IF EXISTS trigger_auto_draw ON public.rooms;
DROP TRIGGER IF EXISTS trigger_check_full_room ON public.rooms;
DROP FUNCTION IF EXISTS public.handle_room_auto_draw();
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid);
DROP FUNCTION IF EXISTS public.check_and_draw_expired_rooms();
DROP FUNCTION IF EXISTS public.ensure_active_rooms();

-- 2. FUNÇÃO: Garante 3 mesas abertas por módulo (A Engrenagem)
CREATE OR REPLACE FUNCTION public.ensure_active_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_mod RECORD;
    v_open_count INTEGER;
    v_needed INTEGER;
BEGIN
    FOR v_mod IN SELECT id, max_participants FROM modules LOOP
        -- Conta mesas abertas ou em processamento
        SELECT COUNT(*) INTO v_open_count 
        FROM rooms 
        WHERE module_id = v_mod.id AND (status = 'open' OR status = 'processing');
        
        v_needed := 3 - v_open_count;
        
        -- Cria as mesas faltantes instantaneamente
        IF v_needed > 0 THEN
            FOR i IN 1..v_needed LOOP
                INSERT INTO rooms (module_id, max_participants, status, expires_at)
                VALUES (v_mod.id, v_mod.max_participants, 'open', NOW() + INTERVAL '3 hours');
            END LOOP;
        END IF;
    END LOOP;
END;
$function$;

-- 3. FUNÇÃO: Realiza o Sorteio e Gira a Mesa (Mesmo com 0 pessoas)
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
    v_p_count INTEGER;
BEGIN
    -- Bloqueia a mesa para processamento
    UPDATE public.rooms SET status = 'processing', updated_at = NOW()
    WHERE id = p_room_id AND status = 'open'
    RETURNING module_id, max_participants INTO v_module_id, v_max_p;
    
    IF NOT FOUND THEN RETURN; END IF;

    -- Verifica quantos participantes reais existem
    SELECT COUNT(*) INTO v_p_count FROM public.participants WHERE room_id = p_room_id;

    -- Se houver pessoas, realiza o sorteio e pagamento
    IF v_p_count > 0 THEN
        SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;
        v_total_pool := v_module_price * v_max_p;
        v_prize_share := v_total_pool / 3.0;

        -- Sorteia 1º e 2º lugares
        SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
        SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

        -- Grava vencedores (Posição 3 é sempre Lucro da Plataforma)
        IF v_winner_1 IS NOT NULL THEN 
            INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner_1, v_prize_share, 1);
            UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_1;
        END IF;
        
        IF v_winner_2 IS NOT NULL THEN 
            INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner_2, v_prize_share, 2);
            UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_2;
        END IF;

        -- Lucro da Plataforma
        INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, NULL, v_prize_share, 3);
    END IF;

    -- Finaliza a mesa antiga e lança as novas
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    PERFORM public.ensure_active_rooms();
END;
$function$;

-- 4. FUNÇÃO: Monitor de Saúde e Tempo (O Coração do Sistema)
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r_id uuid;
BEGIN
  -- Destrava mesas que ficaram "presas" em processamento por mais de 30 segundos
  UPDATE public.rooms SET status = 'open' 
  WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '30 seconds');

  -- Sorteia todas as mesas que expiraram o tempo (ou atingiram lotação se for o caso)
  FOR r_id IN (SELECT id FROM public.rooms WHERE status = 'open' AND (expires_at <= now() OR current_participants >= max_participants)) LOOP
    PERFORM public.perform_automatic_draw(r_id);
  END LOOP;
  
  -- Garante que o ambiente esteja sempre com 3 mesas ativas
  PERFORM public.ensure_active_rooms();
END;
$function$;