-- 1. Garantir que o perfil do Sistema/Admin existe para receber os lucros da plataforma
INSERT INTO public.profiles (id, first_name, balance)
VALUES ('00000000-0000-0000-0000-000000000000', 'PLATAFORMA BORA', 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Refatorar o sorteio para priorizar a criação da nova sala
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
  -- Bloqueio e verificação atômica
  SELECT status, module_id, max_participants, m.price
  INTO v_status, v_module_id, v_max_p, v_module_price
  FROM public.rooms r
  JOIN public.modules m ON r.module_id = m.id
  WHERE r.id = p_room_id
  FOR UPDATE;

  -- Se não estiver aberta, sair para evitar duplicidade
  IF v_status != 'open' THEN
    RETURN;
  END IF;

  -- PASSO 1: Marcar como processando e CRIAR NOVA SALA IMEDIATAMENTE
  -- Isso garante que o frontend mostre a nova sala sem delay
  UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;
  
  INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
  VALUES (v_module_id, v_max_p, 'open', now() + interval '3 hours');

  -- PASSO 2: Cálculos de premiação
  v_total_pool := v_module_price * (SELECT current_participants FROM public.rooms WHERE id = p_room_id);
  
  -- Se não houve participantes, apenas finaliza
  IF v_total_pool <= 0 THEN
    UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
    RETURN;
  END IF;

  v_share_winner := v_total_pool * 0.33;
  v_share_platform := v_total_pool * 0.34;

  -- PASSO 3: Seleção aleatória dos vencedores
  -- Vencedor 1
  SELECT user_id, referred_by INTO v_winner1_id, v_room_ref1_id 
  FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
  
  -- Vencedor 2 (se houver mais de 1 participante)
  SELECT user_id, referred_by INTO v_winner2_id, v_room_ref2_id 
  FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner1_id ORDER BY random() LIMIT 1;

  -- PASSO 4: Pagamentos
  -- Vencedor 1
  IF v_winner1_id IS NOT NULL THEN
    v_winner1_final := v_share_winner;
    IF v_room_ref1_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (v_share_winner * 0.15) WHERE id = v_room_ref1_id;
      v_winner1_final := v_share_winner * 0.85;
    END IF;
    UPDATE public.profiles SET balance = balance + v_winner1_final WHERE id = v_winner1_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner1_id, v_winner1_final, 1);
  END IF;

  -- Vencedor 2
  IF v_winner2_id IS NOT NULL THEN
    v_winner2_final := v_share_winner;
    IF v_room_ref2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + (v_share_winner * 0.15) WHERE id = v_room_ref2_id;
      v_winner2_final := v_share_winner * 0.85;
    END IF;
    UPDATE public.profiles SET balance = balance + v_winner2_final WHERE id = v_winner2_id;
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner2_id, v_winner2_final, 2);
  END IF;

  -- PASSO 5: Crédito à Plataforma (Admin)
  UPDATE public.profiles SET balance = balance + v_share_platform WHERE id = '00000000-0000-0000-0000-000000000000';
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
  VALUES (p_room_id, '00000000-0000-0000-0000-000000000000', v_share_platform, 3);

  -- FINALIZAÇÃO
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;

END;
$function$;