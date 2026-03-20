-- 1. REMOÇÃO COMPLETA PARA LIMPEZA
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;

-- 2. NOVA FUNÇÃO DE SORTEIO (Lógica direta e segura)
CREATE OR REPLACE FUNCTION public.perform_automatic_draw(p_room_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER AS $function$
DECLARE
  _room_id uuid := p_room_id;
  _mod_id uuid;
  _price numeric;
  _max_p int;
  _p_count int;
  _pool numeric;
  _prize_each numeric;
  _w1_id uuid;
  _w2_id uuid;
  _ref_id uuid;
  _open_count int;
BEGIN
  -- 1. Bloqueio e Verificação de Status
  SELECT module_id, max_participants, status 
  INTO _mod_id, _max_p, _price -- Note: aqui pegamos o status temporariamente
  FROM public.rooms WHERE id = _room_id FOR UPDATE;

  -- Se não for 'open', para aqui
  IF NOT FOUND THEN RETURN; END IF;

  -- 2. Busca preço real do módulo
  SELECT price INTO _price FROM public.modules WHERE id = _mod_id;

  -- 3. Conta participantes
  SELECT count(*)::int INTO _p_count FROM public.participants WHERE room_id = _room_id;

  -- 4. Processamento de Prêmios (Apenas se houver jogadores)
  IF _p_count > 0 THEN
    _pool := _price * _p_count;
    _prize_each := _pool * 0.33; -- 33% para cada vencedor real

    -- Sorteia até 2 vencedores diferentes
    SELECT user_id INTO _w1_id FROM public.participants WHERE room_id = _room_id ORDER BY random() LIMIT 1;
    SELECT user_id INTO _w2_id FROM public.participants WHERE room_id = _room_id AND user_id != COALESCE(_w1_id, '00000000-0000-0000-0000-000000000000'::uuid) ORDER BY random() LIMIT 1;

    -- Premiar Vencedor 1
    IF _w1_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + _prize_each WHERE id = _w1_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (_room_id, _w1_id, _prize_each, 1);
      
      -- Bônus de Indicação (5% extra pago pela casa, não descontado do prêmio para simplificar)
      SELECT referred_by INTO _ref_id FROM public.profiles WHERE id = _w1_id;
      IF _ref_id IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (_prize_each * 0.05) WHERE id = _ref_id;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (_ref_id, 'deposit', _prize_each * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
    END IF;

    -- Premiar Vencedor 2
    IF _w2_id IS NOT NULL THEN
      UPDATE public.profiles SET balance = balance + _prize_each WHERE id = _w2_id;
      INSERT INTO public.winners (draw_id, user_id, prize_amount, position) VALUES (_room_id, _w2_id, _prize_each, 2);
      
      SELECT referred_by INTO _ref_id FROM public.profiles WHERE id = _w2_id;
      IF _ref_id IS NOT NULL THEN
        UPDATE public.profiles SET balance = balance + (_prize_each * 0.05) WHERE id = _ref_id;
        INSERT INTO public.transactions (user_id, type, amount, status, payment_method)
        VALUES (_ref_id, 'deposit', _prize_each * 0.05, 'completed', 'Bônus de Indicação');
      END IF;
    END IF;

    -- Registro da Plataforma (Opcional, usando NULL para evitar erro de FK se o usuário não existir)
    INSERT INTO public.winners (draw_id, user_id, prize_amount, position) 
    VALUES (_room_id, NULL, _pool * 0.34, 3);
  END IF;

  -- 5. Finalização da Sala
  UPDATE public.rooms SET status = 'finished' WHERE id = _room_id;

  -- 6. Reposição: Garante que existam 3 salas abertas
  SELECT count(*)::int INTO _open_count FROM public.rooms WHERE module_id = _mod_id AND status = 'open';
  IF _open_count < 3 THEN
    FOR i IN 1..(3 - _open_count) LOOP
      INSERT INTO public.rooms (module_id, max_participants, status, expires_at)
      VALUES (_mod_id, _max_p, 'open', now() + interval '3 hours');
    END LOOP;
  END IF;
END;
$function$;