-- ============================================
-- Seed Data para Desenvolvimento/Testes
-- ============================================

-- Inserir módulos (se ainda não existirem)
INSERT INTO modules (name, price, max_participants) VALUES
  ('M1', 100, 1000),
  ('M2', 200, 800),
  ('M3', 500, 600),
  ('M4', 1000, 400),
  ('M5', 2000, 300),
  ('M6', 5000, 300)
ON CONFLICT (name) DO NOTHING;

-- Função para limpar e recriar salas (útil para testes)
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

-- Função para verificar estatísticas
CREATE OR REPLACE FUNCTION get_system_stats()
RETURNS JSON AS $$
DECLARE
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

-- Comando para resetar tudo (CUIDADO - apaga todos os dados)
-- SELECT reset_all_rooms();

-- Comando para ver estatísticas
-- SELECT get_system_stats();

COMMIT;