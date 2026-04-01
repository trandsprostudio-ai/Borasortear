-- 1. Apagar tabelas primeiro (com CASCADE apaga automaticamente os triggers delas)
DROP TABLE IF EXISTS public.winners CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- 2. Apagar funções (com CASCADE para limpar dependências)
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.generate_ticket_code() CASCADE;
DROP FUNCTION IF EXISTS public.join_room_secure(uuid, uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_active_rooms() CASCADE;
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_and_draw_expired_rooms() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Apagar apenas o trigger que não está nas tabelas públicas (o da auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Limpar transações órfãs
DELETE FROM public.transactions WHERE payment_method IN ('Bônus de Partilha (2%)', 'Bônus de Indicação');