-- 1. Remover Gatilhos
DROP TRIGGER IF EXISTS on_participant_added ON public.participants;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover Funções
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger();
DROP FUNCTION IF EXISTS public.generate_ticket_code();
DROP FUNCTION IF EXISTS public.join_room_secure(uuid, uuid, numeric);
DROP FUNCTION IF EXISTS public.ensure_active_rooms();
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid);
DROP FUNCTION IF EXISTS public.check_and_draw_expired_rooms();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Remover Tabelas (CASCADE para garantir limpeza de dependências)
DROP TABLE IF EXISTS public.winners CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- 4. Opcional: Limpar transações de teste antigas
DELETE FROM public.transactions WHERE payment_method = 'Bônus de Partilha (2%)' OR payment_method = 'Bônus de Indicação';