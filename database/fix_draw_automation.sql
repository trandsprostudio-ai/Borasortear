-- 1. Limpar funções antigas para evitar conflitos
DROP TRIGGER IF EXISTS trigger_auto_draw ON public.rooms;
DROP FUNCTION IF EXISTS public.handle_room_auto_draw();

-- 2. Função de Sorteio Otimizada (Garante Lucro e Vencedores)
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
    -- Tenta bloquear a mesa. Se já estiver processando ou finalizada, sai.
    UPDATE public.rooms 
    SET status = 'processing', updated_at = NOW()
    WHERE id = p_room_id AND status = 'open'
    RETURNING module_id, max_participants INTO v_module_id, v_max_p;
    
    IF NOT FOUND THEN RETURN; END IF;

    -- Pega o preço do módulo
    SELECT price INTO v_module_price FROM public.modules WHERE id = v_module_id;
    v_total_pool := v_module_price * v_max_p;
    v_prize_share := v_total_pool / 3.0;

    -- Sorteia 2 jogadores únicos
    SELECT user_id INTO v_winner_1 FROM public.participants WHERE room_id = p_room_id ORDER BY RANDOM() LIMIT 1;
    SELECT user_id INTO v_winner_2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner_1 ORDER BY RANDOM() LIMIT 1;

    -- Registra os 3 prêmios (1º, 2º e Lucro do Sistema)
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES 
    (p_room_id, v_winner_1, v_prize_share, 1),
    (p_room_id, v_winner_2, v_prize_share, 2),
    (p_room_id, NULL, v_prize_share, 3); -- NULL é a Plataforma

    -- Paga os vencedores reais
    IF v_winner_1 IS NOT NULL THEN UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_1; END IF;
    IF v_winner_2 IS NOT NULL THEN UPDATE public.profiles SET balance = COALESCE(balance, 0) + v_prize_share WHERE id = v_winner_2; END IF;

    -- Finaliza a mesa e gera a substituta instantaneamente
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', NOW() + INTERVAL '3 hours');
END;
$function$;

-- 3. Gatilho para Sorteio por Lotação (Instantâneo)
CREATE OR REPLACE FUNCTION public.handle_room_auto_draw()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_participants >= NEW.max_participants AND NEW.status = 'open' THEN
        PERFORM public.perform_automatic_draw(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_draw
AFTER UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_room_auto_draw();

-- 4. Função de Manutenção (Destrava mesas presas)
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r_id uuid;
BEGIN
  -- Reseta mesas que ficaram em 'processing' por mais de 15 segundos (erro de execução)
  UPDATE public.rooms 
  SET status = 'open' 
  WHERE status = 'processing' AND updated_at < (NOW() - INTERVAL '15 seconds');

  -- Sorteia por tempo expirado
  FOR r_id IN (SELECT id FROM public.rooms WHERE status = 'open' AND expires_at <= now()) LOOP
    PERFORM public.perform_automatic_draw(r_id);
  END LOOP;
END;
$function$;