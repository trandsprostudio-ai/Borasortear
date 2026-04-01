-- ==========================================
-- ETAPA 2: ESTRUTURA DE TABELAS
-- ==========================================

-- 1. Tabelas de Salas (Rooms)
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'processing', 'finished')),
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Tabela de Participantes
CREATE TABLE public.participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, room_id) -- Impede entrada dupla na mesma sala
);

-- 3. Tabela de Vencedores
CREATE TABLE public.winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL se for a taxa da plataforma
  prize_amount NUMERIC NOT NULL,
  position INTEGER NOT NULL, -- 1, 2 ou 3 (Plataforma)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Public read rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Users see own participations" ON public.participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public read winners" ON public.winners FOR SELECT USING (true);

-- ==========================================
-- ETAPA 3: LÓGICA E AUTOMAÇÃO (FUNCTIONS)
-- ==========================================

-- 1. Gerador de Código de Bilhete
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- 2. Função de Sorteio Automático
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_module_price NUMERIC;
  v_total_participants INTEGER;
  v_total_pool NUMERIC;
  v_prize_33_3 NUMERIC;
  v_platform_33_4 NUMERIC;
  v_winner1 UUID;
  v_winner2 UUID;
  v_referrer1 UUID;
  v_referrer2 UUID;
  v_ref_bonus1 NUMERIC;
  v_ref_bonus2 NUMERIC;
BEGIN
  -- 1. Bloquear sala para processamento
  UPDATE public.rooms SET status = 'processing' WHERE id = p_room_id;

  -- 2. Obter dados financeiros
  SELECT m.price, r.current_participants INTO v_module_price, v_total_participants
  FROM public.rooms r JOIN public.modules m ON r.module_id = m.id WHERE r.id = p_room_id;

  v_total_pool := v_module_price * v_total_participants;
  v_prize_33_3 := floor(v_total_pool * 0.3333);
  v_platform_33_4 := v_total_pool - (v_prize_33_3 * 2);

  -- 3. Selecionar 2 vencedores aleatórios distintos
  SELECT user_id INTO v_winner1 FROM public.participants WHERE room_id = p_room_id ORDER BY random() LIMIT 1;
  SELECT user_id INTO v_winner2 FROM public.participants WHERE room_id = p_room_id AND user_id != v_winner1 ORDER BY random() LIMIT 1;

  -- Se houver apenas 1 participante (raro devido às regras), ele ganha tudo ou devolvemos. 
  -- Aqui assumimos fluxo normal de 2+ jogadores.

  -- 4. Processar Vencedor 1
  IF v_winner1 IS NOT NULL THEN
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner1, v_prize_33_3, 1);
    UPDATE public.profiles SET balance = balance + v_prize_33_3 WHERE id = v_winner1;
    
    -- Bónus de Afiliado (5%)
    SELECT referred_by INTO v_referrer1 FROM public.profiles WHERE id = v_winner1;
    IF v_referrer1 IS NOT NULL THEN
      v_ref_bonus1 := floor(v_prize_33_3 * 0.05);
      UPDATE public.profiles SET balance = balance + v_ref_bonus1 WHERE id = v_referrer1;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method) 
      VALUES (v_referrer1, 'deposit', v_ref_bonus1, 'completed', 'Bônus de Indicação');
    END IF;
  END IF;

  -- 5. Processar Vencedor 2
  IF v_winner2 IS NOT NULL THEN
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, v_winner2, v_prize_33_3, 2);
    UPDATE public.profiles SET balance = balance + v_prize_33_3 WHERE id = v_winner2;

    -- Bónus de Afiliado (5%)
    SELECT referred_by INTO v_referrer2 FROM public.profiles WHERE id = v_winner2;
    IF v_referrer2 IS NOT NULL THEN
      v_ref_bonus2 := floor(v_prize_33_3 * 0.05);
      UPDATE public.profiles SET balance = balance + v_ref_bonus2 WHERE id = v_referrer2;
      INSERT INTO public.transactions (user_id, type, amount, status, payment_method) 
      VALUES (v_referrer2, 'deposit', v_ref_bonus2, 'completed', 'Bônus de Indicação');
    END IF;
  END IF;

  -- 6. Taxa da Plataforma (33.4%)
  INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (p_room_id, NULL, v_platform_33_4, 3);

  -- 7. Finalizar Sala e criar uma nova para repor
  UPDATE public.rooms SET status = 'finished' WHERE id = p_room_id;
  
  -- Trigger automático de reposição
  INSERT INTO public.rooms (module_id, max_participants, expires_at)
  SELECT module_id, max_participants, now() + interval '3 hours'
  FROM public.rooms WHERE id = p_room_id;

END;
$$;

-- 3. Função Principal: Entrada Segura (Join Room)
CREATE OR REPLACE FUNCTION public.join_room_secure(p_user_id UUID, p_room_id UUID, p_price NUMERIC)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current_bal NUMERIC;
  v_current_part INTEGER;
  v_max_part INTEGER;
  v_ticket TEXT;
BEGIN
  -- Lock para evitar race conditions
  SELECT balance INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  SELECT current_participants, max_participants INTO v_current_part, v_max_part 
  FROM public.rooms WHERE id = p_room_id AND status = 'open' FOR UPDATE;

  -- Validações
  IF v_current_part >= v_max_part THEN RETURN 'FULL'; END IF;
  IF v_current_bal < p_price THEN RETURN 'NO_BALANCE'; END IF;

  -- Processar Entrada
  v_ticket := public.generate_ticket_code();
  
  UPDATE public.profiles SET balance = balance - p_price WHERE id = p_user_id;
  UPDATE public.rooms SET current_participants = current_participants + 1 WHERE id = p_room_id;
  
  INSERT INTO public.participants (user_id, room_id, ticket_code) VALUES (p_user_id, p_room_id, v_ticket);

  -- Se lotou, sorteia agora mesmo
  IF (v_current_part + 1) >= v_max_part THEN
    PERFORM public.perform_automatic_draw(p_room_id);
  END IF;

  RETURN v_ticket;
END;
$$;

-- 4. Função de Inicialização (Garantir 3 salas por módulo)
CREATE OR REPLACE FUNCTION public.ensure_active_rooms()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_mod RECORD;
  v_count INTEGER;
BEGIN
  FOR v_mod IN SELECT * FROM public.modules LOOP
    SELECT COUNT(*) INTO v_count FROM public.rooms WHERE module_id = v_mod.id AND status = 'open';
    WHILE v_count < 3 LOOP
      INSERT INTO public.rooms (module_id, max_participants, expires_at)
      VALUES (v_mod.id, v_mod.max_participants, now() + interval '3 hours');
      v_count := v_count + 1;
    END LOOP;
  END LOOP;
END;
$$;

-- Executar inicialização
SELECT public.ensure_active_rooms();