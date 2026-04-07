-- 1. Criar tabela de salas BOSS (Isolada da 'rooms' original)
CREATE TABLE public.boss_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  estimated_prize NUMERIC NOT NULL,
  entry_fee NUMERIC NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_analise', 'encerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '72 hours'
);

-- 2. Criar tabela de participantes BOSS (Isolada da 'participants' original)
CREATE TABLE public.boss_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id TEXT REFERENCES public.boss_rooms(id),
  ticket_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir as 2 mesas fixas BOSS
INSERT INTO public.boss_rooms (id, name, estimated_prize, entry_fee)
VALUES 
('boss_1', 'BOSS ELITE I', 4250000, 2000),
('boss_2', 'BOSS SUPREME II', 7620000, 5000)
ON CONFLICT (id) DO NOTHING;

-- 4. Habilitar RLS para segurança
ALTER TABLE public.boss_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boss_participants ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso
CREATE POLICY "Public read boss rooms" ON public.boss_rooms FOR SELECT USING (true);
CREATE POLICY "Users can see own boss participations" ON public.boss_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 6. Função Segura para Entrar no BOSS (Apenas Saldo Real)
CREATE OR REPLACE FUNCTION public.join_boss_room(p_user_id uuid, p_room_id text, p_fee numeric)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance NUMERIC;
  v_ticket TEXT;
BEGIN
  -- Verificar Saldo REAL (Bloquear Bónus)
  SELECT balance INTO v_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  
  IF v_balance < p_fee THEN
    RETURN 'NO_REAL_BALANCE';
  END IF;

  -- Gerar Bilhete
  v_ticket := 'BOSS-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8));

  -- Descontar Saldo
  UPDATE public.profiles SET balance = balance - p_fee WHERE id = p_user_id;

  -- Registar Participação
  INSERT INTO public.boss_participants (user_id, room_id, ticket_code)
  VALUES (p_user_id, p_room_id, v_ticket);

  RETURN v_ticket;
END;
$$;