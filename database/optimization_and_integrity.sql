-- Função para limpar lixo eletrônico (Mesas vazias com mais de 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_empty_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Deleta salas finalizadas há mais de 24h que não tiveram participantes
  DELETE FROM public.rooms 
  WHERE status = 'finished' 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND id NOT IN (SELECT room_id FROM public.participants);
END;
$$;