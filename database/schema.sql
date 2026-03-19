-- ============================================
-- BORA SORTEIAR - Schema Completo de Produção
-- ============================================

-- Habilitar extensões necessáriasCREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de módulos (valores de entrada)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(10) NOT NULL, -- M1, M2, M3, etc.
  price INTEGER NOT NULL CHECK (price > 0),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de salas/mesas
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'processing', 'finished')),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de participantes
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  ticket_code VARCHAR(12) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  bank_info TEXT,
  express_number VARCHAR(20),
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  referred_by UUID REFERENCES profiles(id),
  false_proof_count INTEGER NOT NULL DEFAULT 0 CHECK (false_proof_count >= 0),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de transações financeiras
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  payment_method TEXT,
  proof_url TEXT,
  acceleration_requested BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vencedores
CREATE TABLE IF NOT EXISTS winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prize_amount INTEGER NOT NULL CHECK (prize_amount > 0),
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, position)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'success', 'error')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rooms_module_id ON rooms(module_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_expires_at ON rooms(expires_at);
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_ticket_code ON participants(ticket_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON winners(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar código de bilhete único
CREATE OR REPLACE FUNCTION generate_ticket_code()
RETURNS VARCHAR(12) AS $$
DECLARE
  code VARCHAR(12);
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM participants WHERE ticket_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função de trigger para definir ticket_code antes do insert
CREATE OR REPLACE FUNCTION set_ticket_code()
RETURNS TRIGGER AS $$
BEGIN  NEW.ticket_code := generate_ticket_code();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_code_before_insert
BEFORE INSERT ON participants
FOR EACH ROWEXECUTE FUNCTION set_ticket_code();

-- Função para criar 3 salas por módulo automaticamente
CREATE OR REPLACE FUNCTION create_rooms_for_module()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar 3 salas para cada novo módulo
  FOR i IN 1..3 LOOP
    INSERT INTO rooms (
      module_id,
      status,
      max_participants,
      current_participants,
      expires_at
    ) VALUES (
      NEW.id,
      'open',
      NEW.max_participants,
      0,
      NOW() + INTERVAL '3 hours'
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar salas automaticamente quando um módulo é inserido
CREATE TRIGGER create_rooms_for_module_trigger   AFTER INSERT ON modules 
  FOR EACH ROW   EXECUTE FUNCTION create_rooms_for_module();

-- Função para verificar e fechar salas expiradas ou cheias
CREATE OR REPLACE FUNCTION check_room_closure()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a sala está aberta e (expirada OU cheia)
  IF NEW.status = 'open' AND 
     (NEW.expires_at <= NOW() OR NEW.current_participants >= NEW.max_participants) THEN    NEW.status = 'closed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar fechamento automático de salas
CREATE TRIGGER check_room_closure_trigger   BEFORE UPDATE ON rooms 
  FOR EACH ROW   EXECUTE FUNCTION check_room_closure();

-- Função para executar sorteio automático
CREATE OR REPLACE FUNCTION perform_automatic_draw(p_room_id UUID)
RETURNS VOID AS $$
DECLARE
  room_record RECORD;
  participants_count INTEGER;
  prize_pool INTEGER;
  first_prize INTEGER;
  second_prize INTEGER;
  platform_fee INTEGER;
  winner1_id UUID;
  winner2_id;
  random_offset INTEGER;
BEGIN  -- Buscar dados da sala
  SELECT r.*, m.price, m.name   INTO room_record 
  FROM rooms r   JOIN modules m ON r.module_id = m.id 
  WHERE r.id = p_room_id 
  AND r.status = 'closed';
  
  IF NOT FOUND THEN    RAISE EXCEPTION 'Sala não encontrada ou não está fechada';
  END IF;
  
  -- Contar participantes  SELECT COUNT(*) INTO participants_count   FROM participants 
  WHERE room_id = p_room_id;
  
  IF participants_count < 2 THEN
    RAISE EXCEPTION 'Sala precisa de pelo menos 2 participantes para sorteio';
  END IF;
    -- Calcular premiação (33.3% para cada)
  prize_pool := room_record.price * participants_count;
  first_prize := FLOOR(prize_pool * 0.333);
  second_prize := FLOOR(prize_pool * 0.333);
  platform_fee := prize_pool - first_prize - second_prize;
  
  -- Selecionar 2 vencedores aleatórios
  SELECT user_id INTO winner1_id 
  FROM participants 
  WHERE room_id = p_room_id 
  ORDER BY RANDOM() 
  LIMIT 1;
  
  SELECT user_id INTO winner2_id 
  FROM participants 
  WHERE room_id = p_room_id 
  AND user_id != winner1_id 
  ORDER BY RANDOM() 
  LIMIT 1;
  
  -- Inserir vencedores
  INSERT INTO winners (draw_id, user_id, prize_amount, position)   VALUES 
    (p_room_id, winner1_id, first_prize, 1),
    (p_room_id, winner2_id, second_prize, 2);
  
  -- Atualizar status da sala
  UPDATE rooms 
  SET status = 'finished' 
  WHERE id = p_room_id;
  
  -- Creditar prêmios automaticamente
  UPDATE profiles   SET balance = balance + first_prize 
  WHERE id = winner1_id;
  
  UPDATE profiles 
  SET balance = balance + second_prize   WHERE id = winner2_id;
    -- Registrar transações de prêmios  INSERT INTO transactions (user_id, type, amount, status, payment_method)
  VALUES 
    (winner1_id, 'deposit', first_prize, 'completed', 'Prêmio de Sorteio'),
    (winner2_id, 'deposit', second_prize, 'completed', 'Prêmio de Sorteio');
  
  -- Notificar vencedores
  INSERT INTO notifications (user_id, title, message, type)
  VALUES     (winner1_id, 'VOCÊ GANHOU! 🎉',      format('Parabéns! Você ganhou %s Kz no módulo %s!', first_prize, room_record.name), 
     'success'),
    (winner2_id, 'VOCÊ GANHOU! 🎉',      format('Parabéns! Você ganhou %s Kz no módulo %s!', second_prize, room_record.name), 
     'success');
  
  -- Notificar participantes não vencedores
  INSERT INTO notifications (user_id, title, message, type)
  SELECT 
    p.user_id,
    'Sorteio Finalizado',
    format('O sorteio da sala %s foi concluído. Boa sorte na próxima!', room_record.name),
    'info'
  FROM participants p 
  WHERE p.room_id = p_room_id     AND p.user_id NOT IN (winner1_id, winner2_id);
  
END;
$$ LANGUAGE plpgsql;

-- Função para verificar salas expiradas periodicamente
CREATE OR REPLACE FUNCTION check_and_draw_expired_rooms()
RETURNS VOID AS $$DECLARE
  room_record RECORD;
BEGIN  -- Buscar salas fechadas que ainda não foram sorteadas
  FOR room_record IN    SELECT r.id, r.module_id, m.name, r.current_participants
    FROM rooms r
    JOIN modules m ON r.module_id = m.id
    WHERE r.status = 'closed'
    AND r.expires_at <= NOW()
    AND NOT EXISTS (
      SELECT 1 FROM winners w WHERE w.draw_id = r.id
    )
  LOOP
    BEGIN
      PERFORM perform_automatic_draw(room_record.id);
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue with other rooms
      RAISE NOTICE 'Erro ao sortear sala %: %', room_record.id, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Função para reabrir salas após sorteio (criar novas)
CREATE OR REPLACE FUNCTION reopen_rooms_for_module()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma sala é finalizada, criar uma nova sala para o mesmo módulo
  IF NEW.status = 'finished' AND OLD.status != 'finished' THEN    INSERT INTO rooms (
      module_id,
      status,
      max_participants,
      current_participants,
      expires_at
    ) VALUES (
      NEW.module_id,
      'open',
      NEW.max_participants,
      0,
      NOW() + INTERVAL '3 hours'
    );
  END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para reabrir salas automaticamente
CREATE TRIGGER reopen_rooms_trigger   AFTER UPDATE ON rooms 
  FOR EACH ROW 
  WHEN (OLD.status = 'finished' AND NEW.status = 'finished')
  EXECUTE FUNCTION reopen_rooms_for_module();

-- Inserir módulos iniciais (M1 a M6) - recriar para garantir consistência
DELETE FROM modules WHERE name IN ('M1','M2','M3','M4','M5','M6');

INSERT INTO modules (name, price, max_participants) VALUES
  ('M1', 100, 1000),
  ('M2', 200, 800),
  ('M3', 500, 600),
  ('M4', 1000, 400),
  ('M5', 2000, 300),
  ('M6', 5000, 300);

-- Garantir que a restrição de unicidade exista no nome do módulo
DO $$
BEGIN  BEGIN
    EXECUTE 'ALTER TABLE modules ADD CONSTRAINT modules_name_unique UNIQUE (name)';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Função para resetar todas as salas (useful for testing)
CREATE OR REPLACE FUNCTION reset_all_rooms()
RETURNS VOID AS $$
BEGIN
  -- Deletar todas as salas existentes
  DELETE FROM rooms;
  
  -- Recriar 3 salas para cada módulo
  INSERT INTO rooms (module_id, status, max_participants, current_participants, expires_at)
  SELECT 
    m.id,
    'open',
    m.max_participants,
    0,
    NOW() + INTERVAL '3 hours'
  FROM modules m;
    RAISE NOTICE 'Todas as salas foram resetadas. Criadas 3 salas por módulo.';
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas do sistema
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSON AS $$DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_modules', (SELECT COUNT(*) FROM modules),
    'total_rooms', (SELECT COUNT(*) FROM rooms),
    'open_rooms', (SELECT COUNT(*) FROM rooms WHERE status = 'open'),
    'closed_rooms', (SELECT COUNT(*) FROM rooms WHERE status = 'closed'),
    'processing_rooms', (SELECT COUNT(*) FROM rooms WHERE status = 'processing'),
    'finished_rooms', (SELECT COUNT(*) FROM rooms WHERE status = 'finished'),
    'total_participants', (SELECT COUNT(*) FROM participants),
    'total_winners', (SELECT COUNT(*) FROM winners),
    'total_profiles', (SELECT COUNT(*) FROM profiles),
    'total_transactions', (SELECT COUNT(*) FROM transactions)
  ) INTO stats;
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE modules IS 'Módulos de jogo com diferentes valores de entrada';
COMMENT ON TABLE rooms IS 'Salas/mesas de sorteio por módulo';
COMMENT ON TABLE participants IS 'Participantes de cada sala com código de bilhete';
COMMENT ON TABLE profiles IS 'Perfil estendido dos usuários';
COMMENT ON TABLE transactions IS 'Histórico de depósitos e saques';
COMMENT ON TABLE winners IS 'Vencedores de cada sorteio';
COMMENT ON TABLE notifications IS 'Notificações do sistema';

-- Políticas de segurança RLS (Row Level Security)
-- Nota: Estas políticas devem ser adaptadas conforme sua auth setup

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own participants" ON participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own winners" ON winners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para admin (exemplo - deve ser adaptado)
-- CREATE POLICY "Admin can view all profiles" ON profiles
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

COMMIT;