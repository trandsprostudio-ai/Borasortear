-- 1. Remover triggers redundantes que podem causar duplicidade de salas
DROP TRIGGER IF EXISTS on_room_finished ON public.rooms;
DROP TRIGGER IF EXISTS on_room_full ON public.rooms;

-- 2. Refatorar a função de sorteio para ser a ÚNICA fonte de verdade
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_winner1_id uuid;
  v_winner2_id uuid;
  v_module_id uuid;
  v_max_p int;
  v_module_price numeric;
  v_total_pool numeric;
  v_share_winner numeric;
  v_share_platform numeric;
  v_room_ref1_id uuid;
  v_room_ref2_id uuid;
  v_winner1_final numeric;
  v_winner2_final numeric;
  v_status text;
BEGIN
  -- Bloqueio de linha e verificação de status atômica
  SELECT status, module_id, max_participants, m.price
  INTO v_status, v_module_id, v_max_p, v_module_price
  FROM public.rooms r
  JOIN public.modules m ON r.module_id = m.id
  WHERE r.id = p_room_id
  FOR UPDATE;

  -- Se a sala já não estiver aberta, interrompe para evitar sorteio duplo
  IF v_status != 'open' THEN
    RETURN;
  END IF;

  -- Marcar como processando imediatamente
  UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

  v_total_pool := v_module_price * (SELECT current_participants FROM public.rooms WHERE id = p_room_id);
  v_share_winner := v_total_pool * 0.33;
  v_share_platform := v_total_pool * 0.34;

  -- Escolha dos 2 Vencedores Reais (Aleatoriedade Pura)
  -- Vencedor 1
  SELECT user_id, referred_by INTO v_winner1_id, v_room_ref1_id 
  FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
  
  -- Vencedor 2 (Diferente do primeiro)
  SELECT user_id, referred_by INTO v_winner2_id, v_room_ref2_id 
  FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner1_id ORDER BY random() LIMIT 1;

  -- Se não houver participantes suficientes (caso raro de expiração), cancela ou ajusta
  IF v_winner1_id IS NULL THEN
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    RETURN;
  END IF;

  -- Processamento Vencedor 1
  v_winner1_final := v_share_winner;
  IF v_room_ref1_id IS NOT NULL THEN
    UPDATE public.profiles SET balance = balance + (v_share_winner * 0.15) WHERE id = v_room_ref1_id;
    v_winner1_final := v_share_winner * 0.85;
  END IF;
  UPDATE public.profiles SET balance = balance + v_winner1_final WHERE id = v_winner1_id;
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner1_id, v_winner1_final, 1);

  -- Processamento Vencedor 2 (se existir)
  IF v_winner2_id IS NOT NULL THEN
    v_winner2_final := v_share_winner;
    IF v_room_ref2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (v_share_winner * 0.15) WHERE id = v_room_ref2_id;
      v_winner2_final := v_share_winner * 0.85;
    END IF;
    UPDATE public.profiles SET balance = balance + v_winner2_final WHERE id = v_winner2_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner2_id, v_winner2_final, 2);
  END IF;

  -- Registro da Plataforma (3º Vencedor)
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
  VALUES (p_room_id, '00000000-0000-0000-0000-000000000000', v_share_platform, 3);

  -- Finalizar sala antiga
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

  -- CRIAR NOVA SALA AUTOMATICAMENTE (Garante que sempre haja 3 salas por módulo)
  INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
  VALUES (v_module_id, v_max_p, 'open', now() + interval '3 hours');

END;
$function$;

-- 3. Ajustar o gatilho de novos participantes para ser mais robusto
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_current int;
  v_max int;
  v_status text;
BEGIN
  -- Bloqueia a sala para atualização do contador
  SELECT current_participants, max_participants, status 
  INTO v_current, v_max, v_status
  FROM public.rooms 
  WHERE id = NEW.room_id 
  FOR UPDATE;

  -- Impede entrada se a sala não estiver aberta ou já estiver cheia
  IF v_status != 'open' OR v_current >= v_max THEN
    RAISE EXCEPTION 'Esta mesa já foi encerrada ou está cheia.';
  END IF;

  -- Atualiza o contador
  UPDATE public.rooms 
  SET current_participants = current_participants + 1 
  WHERE id = NEW.room_id
  RETURNING current_participants INTO v_current;

  -- Se atingiu o limite, sorteia imediatamente
  IF v_current >= v_max THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;