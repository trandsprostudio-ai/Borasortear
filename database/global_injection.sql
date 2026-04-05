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