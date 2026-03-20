-- Função de Sorteio Automático Corrigida (Resolvendo Ambiguidade de Colunas)
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  v_winner1_id uuid;
  v_winner2_id uuid;
  v_module_id uuid;
  v_max_p int;
  v_module_price numeric;
  v_total_participants int;
  v_total_pool numeric;
  v_share_winner numeric;
  v_share_platform numeric;
  v_ref1_id uuid;
  v_ref2_id uuid;
  v_winner1_final numeric;
  v_winner2_final numeric;
  v_participant_count int;
  v_platform_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Garantir que o usuário da plataforma existe
  INSERT INTO public.profiles (id, first_name, balance)
  VALUES (v_platform_id, 'PLATAFORMA', 0)
  ON CONFLICT (id) DO NOTHING;

  -- Bloqueio para evitar sorteios duplicados
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE id = p_room_id AND status = 'open' FOR UPDATE) THEN
    RETURN;
  END IF;

  -- Busca dados do módulo e da sala (Corrigido: r.max_participants para evitar ambiguidade)
  SELECT r.module_id, r.max_participants, COALESCE(m.price, 0), r.current_participants
  INTO v_module_id, v_max_p, v_module_price, v_total_participants
  FROM public.rooms r
  JOIN public.modules m ON r.module_id = m.id
  WHERE r.id = p_room_id;

  -- Conta participantes reais
  SELECT count(*) INTO v_participant_count FROM public.participants WHERE room_id = p_room_id;

  -- Caso de mesa vazia: apenas fecha e abre nova
  IF v_participant_count = 0 THEN
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', now() + interval '3 hours');
    RETURN;
  END IF;

  -- Cálculo do prêmio total
  v_total_pool := v_module_price * v_participant_count;
  v_share_winner := COALESCE(v_total_pool * 0.33, 0);
  v_share_platform := COALESCE(v_total_pool * 0.34, 0);

  -- Escolha dos Vencedores
  IF v_participant_count >= 2 THEN
    SELECT user_id INTO v_winner1_id FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
    SELECT user_id INTO v_winner2_id FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner1_id ORDER BY random() LIMIT 1;
  ELSE
    SELECT user_id INTO v_winner1_id FROM public.participants WHERE room_id = p_room_id LIMIT 1;
    v_winner2_id := NULL;
  END IF;

  -- Processamento Vencedor 1
  IF v_winner1_id IS NOT NULL THEN
    v_winner1_final := v_share_winner;
    SELECT referred_by INTO v_ref1_id FROM public.profiles WHERE id = v_winner1_id;
    
    IF v_ref1_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (v_share_winner * 0.05) WHERE id = v_ref1_id;
      v_winner1_final := v_share_winner * 0.95;
      
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (v_ref1_id, 'deposit', v_share_winner * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    
    UPDATE public.profiles SET balance = balance + v_winner1_final WHERE id = v_winner1_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner1_id, v_winner1_final, 1);
  END IF;

  -- Processamento Vencedor 2
  IF v_winner2_id IS NOT NULL THEN
    v_winner2_final := v_share_winner;
    SELECT referred_by INTO v_ref2_id FROM public.profiles WHERE id = v_winner2_id;
    
    IF v_ref2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (v_share_winner * 0.05) WHERE id = v_ref2_id;
      v_winner2_final := v_share_winner * 0.95;
      
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
      VALUES (v_ref2_id, 'deposit', v_share_winner * 0.05, 'completed', 'Bônus de Indicação');
    END IF;
    
    UPDATE public.profiles SET balance = balance + v_winner2_final WHERE id = v_winner2_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner2_id, v_winner2_final, 2);
  ELSE
    v_share_platform := v_share_platform + v_share_winner;
  END IF;

  -- Registro da Plataforma (3º Vencedor)
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
  VALUES (p_room_id, v_platform_id, v_share_platform, 3);

  -- Finalização e Reinício Automático
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
  
  -- Garante que sempre haverá uma sala aberta para este módulo
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE module_id = v_module_id AND status = 'open') THEN
    INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
    VALUES (v_module_id, v_max_p, 'open', now() + interval '3 hours');
  END IF;
END;
$function$