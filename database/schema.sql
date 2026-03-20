-- 1. LIMPEZA RADICAL (CASCADE remove gatilhos dependentes automaticamente)
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.tr_auto_draw_on_full() CASCADE;
DROP FUNCTION IF EXISTS public.process_room_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.update_room_participants() CASCADE;
DROP FUNCTION IF EXISTS public.replace_finished_room() CASCADE;

-- 2. FUNÇÃO DE SORTEIO ULTRA-SEGURA (SEM JOINS E COM NOMES ÚNICOS)
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_target_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  -- Variáveis com prefixos únicos para evitar colisão com nomes de colunas
  var_winner1_id uuid;
  var_winner2_id uuid;
  var_mod_id uuid;
  var_room_max_p int;
  var_mod_price numeric;
  var_pool_total numeric;
  var_prize_share numeric;
  var_platform_share numeric;
  var_ref1_id uuid;
  var_ref2_id uuid;
  var_winner1_net numeric;
  var_winner2_net numeric;
  var_real_participant_count int;
  var_platform_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Garante perfil da plataforma
  INSERT INTO public.profiles (id, first_name, balance)
  VALUES (var_platform_user_id, 'PLATAFORMA', 0)
  ON CONFLICT (id) DO NOTHING;

  -- Bloqueio de segurança (Usa o nome da tabela explicitamente no WHERE)
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE public.rooms.id = p_target_room_id AND public.rooms.status = 'open' FOR UPDATE) THEN
    RETURN;
  END IF;

  -- Busca dados da sala (Sem JOIN para evitar ambiguidade de colunas)
  SELECT module_id, max_participants INTO var_mod_id, var_room_max_p
  FROM public.rooms
  WHERE public.rooms.id = p_target_room_id;

  -- Busca preço do módulo em consulta separada
  SELECT price INTO var_mod_price
  FROM public.modules
  WHERE public.modules.id = var_mod_id;

  -- Conta participantes reais na sala
  SELECT count(*) INTO var_real_participant_count 
  FROM public.participants 
  WHERE public.participants.room_id = p_target_room_id;

  -- Se a mesa estiver vazia, apenas finaliza e abre nova
  IF var_real_participant_count = 0 THEN
    UPDATE public.rooms SET status = 'finished' WHERE public.rooms.id = p_target_room_id;
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (var_mod_id, var_room_max_p, 'open', now() + interval '3 hours');
    RETURN;
  END IF;

  -- Cálculos de prêmios (33% para cada vencedor real, 34% plataforma)
  var_pool_total := COALESCE(var_mod_price, 0) * var_real_participant_count;
  var_prize_share := var_pool_total * 0.33;
  var_platform_share := var_pool_total * 0.34;

  -- Sorteio aleatório de vencedores
  IF var_real_participant_count >= 2 THEN
    SELECT user_id INTO var_winner1_id FROM public.participants WHERE room_id = p_target_room_id ORDER BY random() LIMIT 1;
    SELECT user_id INTO var_winner2_id FROM public.participants WHERE room_id = p_target_room_id AND user_id != var_winner1_id ORDER BY random() LIMIT 1;
  ELSE
    SELECT user_id INTO var_winner1_id FROM public.participants WHERE room_id = p_target_room_id LIMIT 1;
    var_winner2_id := NULL;
  END IF;

  -- Processamento Vencedor 1
  IF var_winner1_id IS NOT NULL THEN
    var_winner1_net := var_prize_share;
    SELECT referred_by INTO var_ref1_id FROM public.profiles WHERE id = var_winner1_id;
    IF var_ref1_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (var_prize_share * 0.05) WHERE id = var_ref1_id;
      var_winner1_net := var_prize_share * 0.95;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (var_ref1_id, 'deposit', var_prize_share * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    UPDATE public.profiles SET balance = balance + var_winner1_net WHERE id = var_winner1_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_target_room_id, var_winner1_id, var_winner1_net, 1);
  END IF;

  -- Processamento Vencedor 2
  IF var_winner2_id IS NOT NULL THEN
    var_winner2_net := var_prize_share;
    SELECT referred_by INTO var_ref2_id FROM public.profiles WHERE id = var_winner2_id;
    IF var_ref2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (var_prize_share * 0.05) WHERE id = var_ref2_id;
      var_winner2_net := var_prize_share * 0.95;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (var_ref2_id, 'deposit', var_prize_share * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    UPDATE public.profiles SET balance = balance + var_winner2_net WHERE id = var_winner2_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_target_room_id, var_winner2_id, var_winner2_net, 2);
  ELSE
    -- Se não houver 2º vencedor, a parte dele vai para a plataforma
    var_platform_share := var_platform_share + var_prize_share;
  END IF;

  -- Registro da Plataforma (3º Vencedor)
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
  VALUES (p_target_room_id, var_platform_user_id, var_platform_share, 3);

  -- Finalização da sala
  UPDATE public.rooms SET status = 'finished' WHERE public.rooms.id = p_target_room_id;
  
  -- Abre nova sala para o módulo
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE module_id = var_mod_id AND status = 'open') THEN
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (var_mod_id, var_room_max_p, 'open', now() + interval '3 hours');
  END IF;
END;
$function$;

-- 3. GATILHO DE PARTICIPAÇÃO (REESCRITO PARA EVITAR AMBIGUIDADE)
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql AS $function$
DECLARE
  var_current_p int;
  var_max_p int;
BEGIN
  -- Atualiza o contador da sala de forma isolada
  UPDATE public.rooms 
  SET current_participants = public.rooms.current_participants + 1 
  WHERE public.rooms.id = NEW.room_id
  RETURNING current_participants, max_participants INTO var_current_p, var_max_p;

  -- Se atingiu o limite, sorteia
  IF var_current_p >= var_max_p THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;

-- 4. RE-ANEXAR GATILHO ÚNICO
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_participant_trigger();