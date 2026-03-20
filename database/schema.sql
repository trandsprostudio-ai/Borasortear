-- 1. LIMPEZA DE FUNÇÕES CONFLITUOSAS
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger() CASCADE;

-- 2. FUNÇÃO DE SORTEIO DEFINITIVA (Sem ambiguidades e com tratamento de erros)
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  -- Variáveis com prefixo 'v_' para evitar qualquer ambiguidade com colunas
  v_target_room_id uuid := p_room_id;
  v_mod_id uuid;
  v_max_p_limit int;
  v_ticket_price numeric;
  v_actual_p_count int;
  v_total_pool numeric;
  v_share_amount numeric;
  v_platform_share numeric;
  v_winner1_id uuid;
  v_winner2_id uuid;
  v_referrer_id uuid;
  v_final_prize numeric;
  v_platform_uuid uuid := '00000000-0000-0000-0000-000000000000';
  v_current_status text;
  v_open_rooms_count int;
  v_rooms_to_create int;
BEGIN
  -- Bloqueio de linha para evitar sorteios duplicados simultâneos
  SELECT status, module_id, max_participants 
  INTO v_current_status, v_mod_id, v_max_p_limit
  FROM public.rooms 
  WHERE id = v_target_room_id 
  FOR UPDATE;

  -- Só sorteia se a sala estiver aberta
  IF v_current_status != 'open' THEN
    RETURN;
  END IF;

  -- Muda status para processando imediatamente
  UPDATE public.rooms SET status = 'processing' WHERE id = v_target_room_id;

  -- Busca preço do módulo
  SELECT price INTO v_ticket_price FROM public.modules WHERE id = v_mod_id;

  -- Conta participantes reais
  SELECT count(*)::int INTO v_actual_p_count FROM public.participants WHERE room_id = v_target_room_id;

  -- Se a mesa estiver vazia, apenas finaliza e pula para a reposição
  IF v_actual_p_count > 0 THEN
    v_total_pool := COALESCE(v_ticket_price, 0) * v_actual_p_count;
    v_share_amount := v_total_pool * 0.33;
    v_platform_share := v_total_pool * 0.34;

    -- Sorteio de Vencedores Reais
    SELECT user_id INTO v_winner1_id FROM public.participants WHERE room_id = v_target_room_id ORDER BY random() LIMIT 1;
    
    IF v_actual_p_count >= 2 THEN
      SELECT user_id INTO v_winner2_id FROM public.participants WHERE room_id = v_target_room_id AND user_id != v_winner1_id ORDER BY random() LIMIT 1;
    END IF;

    -- Processar Vencedor 1
    IF v_winner1_id IS NOT NULL THEN
      v_final_prize := v_share_amount;
      SELECT referred_by INTO v_referrer_id FROM public.profiles WHERE id = v_winner1_id;
      
      IF v_referrer_id IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (v_share_amount * 0.05) WHERE id = v_referrer_id;
        v_final_prize := v_share_amount * 0.95;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (v_referrer_id, 'deposit', v_share_amount * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
      
      UPDATE public.profiles SET balance = balance + v_final_prize WHERE id = v_winner1_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (v_target_room_id, v_winner1_id, v_final_prize, 1);
    END IF;

    -- Processar Vencedor 2
    IF v_winner2_id IS NOT NULL THEN
      v_final_prize := v_share_amount;
      SELECT referred_by INTO v_referrer_id FROM public.profiles WHERE id = v_winner2_id;
      
      IF v_referrer_id IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (v_share_amount * 0.05) WHERE id = v_referrer_id;
        v_final_prize := v_share_amount * 0.95;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (v_referrer_id, 'deposit', v_share_amount * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
      
      UPDATE public.profiles SET balance = balance + v_final_prize WHERE id = v_winner2_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (v_target_room_id, v_winner2_id, v_final_prize, 2);
    ELSE
      -- Se houver apenas 1 jogador, a plataforma fica com a parte do 2º vencedor
      v_platform_share := v_platform_share + v_share_amount;
    END IF;

    -- Registro da Plataforma (Usamos NULL ou UUID especial sem FK se necessário, mas aqui mantemos o registro)
    -- Nota: Se houver erro de FK, o administrador deve garantir que o UUID da plataforma exista ou remover a FK de winners.user_id
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
    VALUES (v_target_room_id, v_platform_uuid, v_platform_share, 3);
  END IF;

  -- Finaliza a sala
  UPDATE public.rooms SET status = 'finished' WHERE id = v_target_room_id;

  -- REPOSIÇÃO: Garante que sempre existam exatamente 3 salas abertas para este módulo
  SELECT count(*)::int INTO v_open_rooms_count FROM public.rooms WHERE module_id = v_mod_id AND status = 'open';
  v_rooms_to_create := 3 - v_open_rooms_count;
  
  IF v_rooms_to_create > 0 THEN
    FOR i IN 1..v_rooms_to_create LOOP
      INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
      VALUES (v_mod_id, v_max_p_limit, 'open', now() + interval '3 hours');
    END LOOP;
  END IF;
END;
$function$;

-- 3. GATILHO DE PARTICIPAÇÃO (Simplificado e sem ambiguidades)
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql AS $function$
DECLARE
  v_current_p int;
  v_max_p int;
BEGIN
  UPDATE public.rooms 
  SET current_participants = current_participants + 1 
  WHERE id = NEW.room_id
  RETURNING current_participants, max_participants INTO v_current_p, v_max_p;

  IF v_current_p >= v_max_p THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. RE-ANEXAR GATILHO
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_participant_trigger();