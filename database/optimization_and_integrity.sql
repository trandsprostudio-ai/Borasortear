-- 1. Índices de Performance (Velocidade 100%)
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_module_id ON public.rooms(module_id);
CREATE INDEX IF NOT EXISTS idx_participants_room_id ON public.participants(room_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON public.winners(draw_id);

-- 2. Função "Vassoura": Sorteia mesas expiradas pelo tempo
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_room_record RECORD;
BEGIN
  -- Procurar salas 'open' que já passaram da hora de expirar e têm pelo menos 1 participante
  FOR v_room_record IN 
    SELECT id FROM public.rooms 
    WHERE status = 'open' 
    AND expires_at <= now() 
    AND current_participants > 0
  LOOP
    PERFORM public.perform_automatic_draw(v_room_record.id);
  END LOOP;

  -- Fechar salas vazias e criar novas
  UPDATE public.rooms SET status = 'closed' 
  WHERE status = 'open' AND expires_at <= now() AND current_participants = 0;
  
  PERFORM public.ensure_active_rooms();
END;
$$;

-- 3. Função de Emergência (Resetar salas 'presas' em processing por erro)
CREATE OR REPLACE FUNCTION public.reset_stuck_rooms()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.rooms SET status = 'open' 
  WHERE status = 'processing' AND created_at < now() - interval '10 minutes';
END;
$$;