-- 1. Função que garante 3 mesas ativas por módulo SEMPRE
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
        -- Conta quantas mesas estão abertas ou processando para este módulo
        SELECT COUNT(*) INTO v_open_count 
        FROM rooms 
        WHERE module_id = v_mod.id AND (status = 'open' OR status = 'processing');
        
        v_needed := 3 - v_open_count;
        
        -- Se faltarem mesas, cria as novas instantaneamente
        IF v_needed > 0 THEN
            FOR i IN 1..v_needed LOOP
                INSERT INTO rooms (module_id, max_participants, status, expires_at)
                VALUES (v_mod.id, v_mod.max_participants, 'open', NOW() + INTERVAL '3 hours');
            END LOOP;
        END IF;
    END LOOP;
END;
$function$;

-- 2. Função de Sorteio Robusta (Lida com 0 participantes)
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
    -- Bloqueio preventivo
    UPDATE public.rooms SET status = 'processing', updated_at = NOW()
    WHERE id = p_room_id AND status = 'open'
    RETURNING module_id, max_participants INTO v_module_id, v_max_p;
    
    IF NOT FOUND THEN RETURN; END IF;

    -- Conta participantes reais
    SELECT COUNT(*) INTO v_p_count FROM public.participants WHERE room_id = p_room_id;

    -- Cálculos de prêmio baseados na lotação máxima
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;
    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool / 3.0;

    -- Se houver participantes, sorteia. Se não, apenas finaliza.
    IF v_p_count > 0 THEN
        -- Sorteia 1º Lugar
        SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
        -- Sorteia 2º Lugar (se houver mais de 1 pessoa)
        SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

        -- Grava vencedores (NULL para plataforma)
        INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
        (p_room_id, v_winner_1, v_prize_share, 1),
        (p_room_id, v_winner_2, v_prize_share, 2),
        (p_room_id, NULL, v_prize_share, 3);

        -- Paga vencedores
        IF v_winner_1 IS NOT NULL THEN UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_1; END IF;
        IF v_winner_2 IS NOT NULL THEN UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_2; END IF;
    END IF;

    -- Marca como finalizada (Ela sairá da vitrine do site)
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    
    -- Garante que o sistema reponha a mesa imediatamente
    PERFORM public.ensure_active_rooms();
END;
$function$;

-- 3. Monitor Global de Tempo e Lotação
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r_id uuid;
BEGIN
  -- 1. Destrava mesas presas em processamento (crash de rede)
  UPDATE public.rooms SET status = 'open' 
  WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '30 seconds');

  -- 2. Sorteia mesas expiradas
  FOR r_id IN (SELECT id FROM public.rooms WHERE status = 'open' AND expires_at <= now()) LOOP
    PERFORM public.perform_automatic_draw(r_id);
  END LOOP;
  
  -- 3. Garante que sempre existam 3 mesas por módulo
  PERFORM public.ensure_active_rooms();
END;
$function$;