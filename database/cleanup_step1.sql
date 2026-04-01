-- 1. Remover Tabelas com CASCADE (Isso limpa dependências de colunas e chaves estrangeiras)
DROP TABLE IF EXISTS public.winners CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.draws CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;

-- 2. Remover Funções com CASCADE
DROP FUNCTION IF EXISTS public.handle_new_participant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.generate_ticket_code() CASCADE;
DROP FUNCTION IF EXISTS public.join_room_secure(uuid, uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_active_rooms() CASCADE;
DROP FUNCTION IF EXISTS public.perform_automatic_draw(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.check_and_draw_expired_rooms() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Remover Triggers remanescentes
DROP TRIGGER IF EXISTS on_participant_added ON public.participants;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Limpeza de transações de sistema órfãs
DELETE FROM public.transactions WHERE payment_method IN ('Bônus de Partilha (2%)', 'Bônus de Indicação');