-- Garantir que a função de limpeza possa ser chamada com segurança
CREATE OR REPLACE FUNCTION public.check_and_draw_expired_rooms()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  r_id uuid;
BEGIN
  -- Seleciona salas abertas que já passaram do tempo e as sorteia
  FOR r_id IN (
    SELECT id FROM public.rooms 
    WHERE status = 'open' AND expires_at <= now()
  ) LOOP
    PERFORM public.perform_automatic_draw(r_id);
  END LOOP;
END;
$function$;

-- Ajustar o gatilho de entrada para impedir entrada em salas expiradas
CREATE OR REPLACE FUNCTION public.handle_new_participant_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_current int;
  v_max int;
  v_status text;
  v_expires timestamp with time zone;
BEGIN
  SELECT current_participants, max_participants, status, expires_at 
  INTO v_current, v_max, v_status, v_expires
  FROM public.rooms 
  WHERE id = NEW.room_id 
  FOR UPDATE;

  -- Se a sala expirou mas ainda está 'open', força o sorteio e cancela a entrada
  IF v_status = 'open' AND v_expires <= now() THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
    RAISE EXCEPTION 'Esta mesa acaba de expirar e está sendo sorteada. Por favor, entre na nova mesa criada.';
  END IF;

  IF v_status != 'open' OR v_current >= v_max THEN
    RAISE EXCEPTION 'Esta mesa já foi encerrada ou está cheia.';
  END IF;

  UPDATE public.rooms 
  SET current_participants = current_participants + 1 
  WHERE id = NEW.room_id
  RETURNING current_participants INTO v_current;

  IF v_current >= v_max THEN
    PERFORM public.perform_automatic_draw(NEW.room_id);
  END IF;

  RETURN NEW;
END;
$function$;