-- 1. REFORÇO DE SEGURANÇA E INTEGRIDADE
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS balance_non_negative;
ALTER TABLE public.profiles ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS participants_limit;
ALTER TABLE public.rooms ADD CONSTRAINT participants_limit CHECK (current_participants <= max_participants);

-- 2. FUNÇÃO DE SORTEIO CONSOLIDADA E ATÔMICA
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  v_room_record RECORD;
  v_mod_price numeric;
  v_p_count int;
  v_pool numeric;
  v_win_share numeric;
  v_plat_share numeric;
  v_w1_id uuid;
  v_w2_id uuid;
  v_ref1 uuid;
  v_ref2 uuid;
  v_w1_net numeric;
  v_w2_net numeric;
  v_plat_user uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Bloqueio e verificação de status imediata para evitar concorrência
  SELECT * INTO v_room_record 
  FROM public.rooms 
  WHERE id = p_room_id AND status = 'open' 
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN RETURN; END IF;

  -- Marca como processando para que ninguém mais mexa
  UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

  -- Busca preço do módulo
  SELECT price INTO v_mod_price FROM public.modules WHERE id = v_room_record.module_id;

  -- Conta participantes reais
  SELECT count(*) INTO v_p_count FROM public.participants WHERE room_id = p_room_id;

  -- Se a mesa estiver vazia, apenas finaliza
  IF v_p_count = 0 THEN
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
  ELSE
    v_pool := COALESCE(v_mod_price, 0) * v_p_count;
    v_win_share := v_pool * 0.33;
    v_plat_share := v_pool * 0.34;

    -- Sorteio de Vencedores
    IF v_p_count >= 2 THEN
      SELECT user_id INTO v_w1_id FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
      SELECT user_id INTO v_w2_id FROM public.participants WHERE room_id = p_room_id AND user_id != v_w1_id ORDER BY random() LIMIT 1;
    ELSE
      SELECT user_id INTO v_w1_id FROM public.participants WHERE room_id = p_room_id LIMIT 1;
      v_w2_id := NULL;
    END IF;

    -- Processamento Vencedor 1
    IF v_w1_id IS NOT NULL THEN
      v_w1_net := v_win_share;
      SELECT referred_by INTO v_ref1 FROM public.profiles WHERE id = v_w1_id;
      IF v_ref1 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (v_win_share * 0.05) WHERE id = v_ref1;
        v_w1_net := v_win_share * 0.95;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (v_ref1, 'deposit', v_win_share * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
      UPDATE public.profiles SET balance = balance + v_w1_net WHERE id = v_w1_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_w1_id, v_w1_net, 1);
    END IF;

    -- Processamento Vencedor 2
    IF v_w2_id IS NOT NULL THEN
      v_w2_net := v_win_share;
      SELECT referred_by INTO v_ref2 FROM public.profiles WHERE id = v_w2_id;
      IF v_ref2 IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (v_win_share * 0.05) WHERE id = v_ref2;
        v_w2_net := v_win_share * 0.95;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (v_ref2, 'deposit', v_win_share * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
      UPDATE public.profiles SET balance = balance + v_w2_net WHERE id = v_w2_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_w2_id, v_w2_net, 2);
    ELSE
      v_plat_share := v_plat_share + v_win_share;
    END IF;

    -- Registro da Plataforma
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
    VALUES (p_room_id, v_plat_user, v_plat_share, 3);

    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
  END IF;

  -- REPOSIÇÃO AUTOMÁTICA: Garante que sempre existam 3 salas abertas por módulo
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE module_id = v_room_record.module_id AND status = 'open') THEN
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_room_record.module_id, v_room_record.max_participants, 'open', now() + interval '3 hours');
  END IF;
END;
$function$;

-- 3. GATILHO DE PARTICIPAÇÃO OTIMIZADO
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql AS $function$
DECLARE
  v_curr int;
  v_max_limit int;
BEGIN
  -- Atualização atômica do contador
  UPDATE public.rooms 
  SET current_participants = current_participants + 1 
  WHERE id = NEW.room_id
  RETURNING current_participants, max_participants INTO v_curr, v_max_limit;

  -- Se atingiu o limite, sorteia
  IF v_curr >= v_max_limit THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;