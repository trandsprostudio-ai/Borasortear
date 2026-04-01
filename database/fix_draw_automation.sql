-- 1. Função para garantir que sempre existam 3 salas abertas para cada módulo
CREATE OR REPLACE FUNCTION ensure_active_rooms()
RETURNS VOID AS $$
DECLARE
    v_mod RECORD;
    v_open_count INTEGER;
    v_needed INTEGER;
BEGIN
    FOR v_mod IN SELECT id, max_participants FROM modules LOOP
        -- Contar quantas salas abertas ou em processamento existem para este módulo
        SELECT COUNT(*) INTO v_open_count 
        FROM rooms 
        WHERE module_id = v_mod.id AND (status = 'open' || status = 'processing');
        
        v_needed := 3 - v_open_count;
        
        -- Se faltarem salas, criar as necessárias
        IF v_needed > 0 THEN
            FOR i IN 1..v_needed LOOP
                INSERT INTO rooms (module_id, max_participants, status, expires_at)
                VALUES (v_mod.id, v_mod.max_participants, 'open', NOW() + INTERVAL '3 hours');
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para chamar a função sempre que uma sala for finalizada
CREATE OR REPLACE FUNCTION trigger_ensure_rooms()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM ensure_active_rooms();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_ensure_rooms_after_update ON rooms;
CREATE TRIGGER tr_ensure_rooms_after_update
AFTER UPDATE OF status ON rooms
FOR EACH ROW
WHEN (NEW.status = 'finished')
EXECUTE FUNCTION trigger_ensure_rooms();

-- 3. Executar uma vez agora para criar as salas que faltam
SELECT ensure_active_rooms();