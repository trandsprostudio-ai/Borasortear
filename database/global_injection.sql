-- Função para Injeção Individual Segura
CREATE OR REPLACE FUNCTION public.inject_ghosts_secure(p_room_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    T INTEGER; R INTEGER; F INTEGER;
    v_status TEXT; v_exists BOOLEAN; v_ticket TEXT; i INTEGER;
BEGIN
    -- Obter dados da sala
    SELECT max_participants, current_participants, status INTO T, R, v_status
    FROM public.rooms WHERE id = p_room_id;

    -- Validações
    IF v_status != 'open' THEN RETURN 'STATUS_INVALIDO'; END IF;

    -- Bloqueio de Duplicação (Evitar injetar na mesma sala várias vezes seguidas)
    SELECT EXISTS (SELECT 1 FROM public.participants WHERE room_id = p_room_id AND is_real = false)
    INTO v_exists;
    IF v_exists THEN RETURN 'JA_INJECTADO'; END IF;

    -- Cálculo Proporcional (30% a 40%) + Ruído
    F := round(T * (random() * (0.40 - 0.30) + 0.30)) + (floor(random() * 5) - 2);
    
    -- Normalização de Segurança
    F := min(F, T - R);
    IF F <= 0 THEN RETURN 'SEM_ESPACO'; END IF;

    -- Inserção dos Fantasmas
    FOR i IN 1..F LOOP
        v_ticket := public.generate_ticket_code();
        INSERT INTO public.participants (room_id, user_id, is_real, ticket_code)
        VALUES (p_room_id, NULL, false, v_ticket);
    END LOOP;

    -- Atualizar contador visual
    UPDATE public.rooms SET current_participants = current_participants + F WHERE id = p_room_id;

    -- Log
    INSERT INTO public.admin_logs (room_id, action, quantity)
    VALUES (p_room_id, 'ghost_injection', F);

    RETURN 'SUCESSO:' || F;
END;
$function$;

-- Função para Injeção Global em Massa
CREATE OR REPLACE FUNCTION public.inject_ghosts_globally()
 RETURNS TABLE(rooms_affected INTEGER, total_ghosts INTEGER)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_room RECORD;
    v_result TEXT;
    v_count INTEGER := 0;
    v_total_f INTEGER := 0;
    v_f_added INTEGER;
BEGIN
    FOR v_room IN SELECT id FROM public.rooms WHERE status = 'open' LOOP
        v_result := public.inject_ghosts_secure(v_room.id);
        
        IF v_result STARTS WITH 'SUCESSO' THEN
            v_count := v_count + 1;
            v_f_added := (split_part(v_result, ':', 2))::INTEGER;
            v_total_f := v_total_f + v_f_added;
        END IF;
    END LOOP;

    RETURN QUERY SELECT v_count, v_total_f;
END;
$function$;