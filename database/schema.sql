-- 1. LIMPEZA TOTAL (Removendo absolutamente tudo que possa conflitar)
DROP TRIGGER IF EXISTS on_participant_added ON public.participants;
DROP TRIGGER IF EXISTS on_room_full ON public.rooms;
DROP TRIGGER IF EXISTS on_room_finished ON public.rooms;

DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.tr_auto_draw_on_full() CASCADE;
DROP FUNCTION IF EXISTS public.process_room_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_room_participants() CASCADE;
DROP FUNCTION IF EXISTS public.replace_finished_room() CASCADE;

-- 2. FUNÇÃO DE SORTEIO COM QUALIFICAÇÃO ABSOLUTA
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  v_mod_id uuid;
  v_room_max int;
  v_price numeric;
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
  -- Garante perfil da plataforma
  INSERT INTO public.profiles (id, first_name, balance)
  VALUES (v_plat_user, 'PLATAFORMA', 0)
  ON CONFLICT (id) DO NOTHING;

  -- Bloqueio de segurança com alias explícito
  IF NOT EXISTS (SELECT 1 FROM public.rooms AS r WHERE r.id = p_room_id AND r.status = 'open' FOR UPDATE) THEN
    RETURN;
  END IF;

  -- Busca dados da sala usando alias 'r'
  SELECT r.module_id, r.max_participants INTO v_mod_id, v_room_max
  FROM public.rooms AS r
  WHERE r.id = p_room_id;

  -- Busca preço do módulo usando alias 'm'
  SELECT m.price INTO v_price
  FROM public.modules AS m
  WHERE m.id = v_mod_id;

  -- Conta participantes usando alias 'p'
  SELECT count(*) INTO v_p_count 
  FROM public.participants AS p 
  WHERE p.room_id = p_room_id;

  -- Mesa vazia: finaliza e abre nova
  IF v_p_count = 0 THEN
    UPDATE public.rooms AS r SET status = 'finished' WHERE r.id = p_room_id;
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_mod_id, v_room_max, 'open', now() + interval '3 hours');
    RETURN;
  END IF;

  v_pool := COALESCE(v_price, 0) * v_p_count;
  v_win_share := v_pool * 0.33;
  v_plat_share := v_pool * 0.34;

  -- Sorteio
  IF v_p_count >= 2 THEN
    SELECT p.user_id INTO v_w1_id FROM public.participants AS p WHERE p.room_id = p_room_id ORDER BY random() LIMIT 1;
    SELECT p.user_id INTO v_w2_id FROM public.participants AS p WHERE p.room_id = p_room_id AND p.user_id != v_w1_id ORDER BY random() LIMIT 1;
  ELSE
    SELECT p.user_id INTO v_w1_id FROM public.participants AS p WHERE p.room_id = p_room_id LIMIT 1;
    v_w2_id := NULL;
  END IF;

  -- Vencedor 1
  IF v_w1_id IS NOT NULL THEN
    v_w1_net := v_win_share;
    SELECT prof.referred_by INTO v_ref1 FROM public.profiles AS prof WHERE prof.id = v_w1_id;
    IF v_ref1 IS NOT NULL THEN
      UPDATE public.profiles AS prof SET balance = prof.balance + (v_win_share * 0.05) WHERE prof.id = v_ref1;
      v_w1_net := v_win_share * 0.95;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (v_ref1, 'deposit', v_win_share * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    UPDATE public.profiles AS prof SET balance = prof.balance + v_w1_net WHERE prof.id = v_w1_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_w1_id, v_w1_net, 1);
  END IF;

  -- Vencedor 2
  IF v_w2_id IS NOT NULL THEN
    v_w2_net := v_win_share;
    SELECT prof.referred_by INTO v_ref2 FROM public.profiles AS prof WHERE prof.id = v_w2_id;
    IF v_ref2 IS NOT NULL THEN
      UPDATE public.profiles AS prof SET balance = prof.balance + (v_win_share * 0.05) WHERE prof.id = v_ref2;
      v_w2_net := v_win_share * 0.95;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (v_ref2, 'deposit', v_win_share * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    UPDATE public.profiles AS prof SET balance = prof.balance + v_w2_net WHERE prof.id = v_w2_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_w2_id, v_w2_net, 2);
  ELSE
    v_plat_share := v_plat_share + v_win_share;
  END IF;

  -- Plataforma
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
  VALUES (p_room_id, v_plat_user, v_plat_share, 3);

  -- Finaliza e abre nova
  UPDATE public.rooms AS r SET status = 'finished' WHERE r.id = p_room_id;
  
  IF NOT EXISTS (SELECT 1 FROM public.rooms AS r WHERE r.module_id = v_mod_id AND r.status = 'open') THEN
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_mod_id, v_room_max, 'open', now() + interval '3 hours');
  END IF;
END;
$function$;

-- 3. GATILHO COM QUALIFICAÇÃO ABSOLUTA NO RETURNING
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql AS $function$
DECLARE
  v_curr int;
  v_max_limit int;
BEGIN
  -- Atualiza usando alias 'rm' e qualifica o RETURNING
  UPDATE public.rooms AS rm
  SET current_participants = rm.current_participants + 1 
  WHERE rm.id = NEW.room_id
  RETURNING rm.current_participants, rm.max_participants INTO v_curr, v_max_limit;

  -- Dispara sorteio se atingir o limite
  IF v_curr >= v_max_limit THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. RE-ANEXAR GATILHO
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_participant_trigger();