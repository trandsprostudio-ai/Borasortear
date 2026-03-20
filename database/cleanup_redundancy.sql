-- 1. Remover funções obsoletas que foram substituídas pela lógica centralizada
DROP FUNCTION IF EXISTS public.process_room_draw(uuid);
DROP FUNCTION IF EXISTS public.update_room_participants();
DROP FUNCTION IF EXISTS public.replace_finished_room();
DROP FUNCTION IF EXISTS public.tr_auto_draw_on_full();

-- 2. Garantir que apenas o trigger correto esteja ativo na tabela de participantes
DROP TRIGGER IF EXISTS on_participant_added ON public.participants;
CREATE TRIGGER on_participant_added
  AFTER INSERT ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_participant_trigger();

-- 3. Remover triggers antigos da tabela de salas (a lógica agora está na função de sorteio)
DROP TRIGGER IF EXISTS on_room_finished ON public.rooms;
DROP TRIGGER IF EXISTS on_room_full ON public.rooms;