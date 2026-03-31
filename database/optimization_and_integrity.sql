-- 1. Função de sorteio à prova de falhas
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_module_id uuid;
  v_max_p int;
  v_module_price numeric;
  v_total_pool numeric;
  v_count int;
  v_status text;
  v_winner1_id uuid;
  v_winner2_id uuid;
  v_share_winner numeric;
  v_share_platform numeric;
BEGIN
  -- 1. Bloqueio e Verificação de Status
  SELECT status, module_id, max_participants, m.price
  INTO v_status, v_module_id, v_max_p, v_module_price
  FROM public.rooms r
  JOIN public.modules m ON r.module_id = m.id
  WHERE r.id = p_room_id
  FOR UPDATE;

  -- Se já não estiver aberta, ignorar
  IF v_status != 'open' THEN
    RETURN;
  END IF;

  -- 2. Mudança IMEDIATA de status para evitar execuções paralelas
  UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

  -- 3. Contagem de participantes
  SELECT COUNT(*) INTO v_count FROM public.participants WHERE room_id = p_room_id;

  -- 4. CRIAÇÃO DA NOVA SALA (Sempre criar, independente de ter gente na anterior)
  INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
  VALUES (v_module_id, v_max_p, 'open', now() + interval '3 hours');

  -- 5. Se houver participantes, processa prêmios
  IF v_count > 0 THEN
    v_total_pool := v_module_price * v_count;
    v_share_winner := v_total_pool * 0.33;
    v_share_platform := v_total_pool * 0.34;

    -- Vencedor 1
    SELECT user_id INTO v_winner1_id FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
    IF v_winner1_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + v_share_winner WHERE id = v_winner1_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner1_id, v_share_winner, 1);
    END IF;

    -- Vencedor 2
    SELECT user_id INTO v_winner2_id FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner1_id ORDER BY random() LIMIT 1;
    IF v_winner2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + v_share_winner WHERE id = v_winner2_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner2_id, v_share_winner, 2);
    END IF;

    -- Plataforma (Admin)
    UPDATE public.profiles SET balance = balance + v_share_platform WHERE id = '00000000-0000-0000-0000-000000000000';
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
    VALUES (p_room_id, '00000000-0000-0000-0000-000000000000', v_share_platform, 3);
  END IF;

  -- 6. Finalização garantida
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

EXCEPTION WHEN OTHERS THEN
  -- Em caso de erro crítico, força a sala a fechar para não travar o sistema
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
END;
$function$;