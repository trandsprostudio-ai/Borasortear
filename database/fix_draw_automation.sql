-- 1. Função de Sorteio Ultra-Rápida
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
    -- Bloqueia e valida em um único passo
    UPDATE public.rooms 
    SET status = 'processing' 
    WHERE id = p_room_id AND status = 'open'
    RETURNING module_id, max_participants INTO v_module_id, v_max_p;
    
    IF NOT FOUND THEN RETURN; END IF;

    -- Preço do módulo
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;

    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool * 0.3333;

    -- Sorteio (Apenas 2 reais, 3º é Plataforma)
    SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Registrar vencedores (NULL = Plataforma)
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, NULL, v_prize_share, 3);

    -- Crédito instantâneo
    IF v_winner_1 IS NOT NULL THEN UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_1; END IF;
    IF v_winner_2 IS NOT NULL THEN UPDATE public.profiles SET balance = balance + v_prize_share WHERE id = v_winner_2; END IF;

    -- Finaliza e cria nova mesa no mesmo comando (Atômico)
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');
END;
$function$;

-- 2. Função de Check que também destrava mesas "órfãs"
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r_id uuid;
BEGIN
  -- Destrava mesas que ficaram presas em 'processing' por mais de 1 minuto (erro de servidor)
  UPDATE public.rooms 
  SET status = 'open' 
  WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '1 minute');

  -- Sorteia mesas expiradas
  FOR r_id IN (
    SELECT id FROM public.rooms 
    WHERE status = 'open' AND expires_at <= now()
  ) LOOP
    PERFORM public.perform_automatic_draw(r_id);
  END LOOP;
END;
$function$;