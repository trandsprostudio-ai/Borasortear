-- Função para garantir que existam pelo menos 3 salas abertas por módulo
CREATE OR REPLACE FUNCTION public.ensure_active_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  m_record RECORD;
  v_active_count int;
  v_needed int;
BEGIN
  FOR m_record IN SELECT id, max_participants FROM public.modules LOOP
    -- Conta quantas salas abertas este módulo tem
    SELECT COUNT(*) INTO v_active_count 
    FROM public.rooms 
    WHERE module_id = m_record.id AND status = 'open';
    
    v_needed := 3 - v_active_count;
    
    -- Se faltarem salas, cria elas
    IF v_needed > 0 THEN
      FOR i IN 1..v_needed LOOP
        INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
        VALUES (m_record.id, m_record.max_participants, 'open', now() + interval '3 hours');
      END LOOP;
    END IF;
  END LOOP;
END;
$function$;

-- Executar uma vez agora mesmo para limpar o erro
SELECT public.ensure_active_rooms();