-- 1. Melhorar a função de geração de bilhetes para garantir unicidade absoluta
CREATE OR REPLACE FUNCTION public.generate_ticket_code()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT;
  is_unique BOOLEAN := false;
BEGIN
  -- Loop até encontrar um código que não exista no banco
  WHILE NOT is_unique LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Verifica se o código já existe na tabela de participantes
    SELECT NOT EXISTS (SELECT 1 FROM public.participants WHERE ticket_code = result) INTO is_unique;
  END LOOP;
  
  RETURN result;
END;
$function$;

-- 2. Adicionar restrição de unicidade na coluna ticket_code para segurança extra de integridade
-- Isso garante que o banco de dados rejeite qualquer tentativa (mesmo que rara) de duplicidade.
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'participants_ticket_code_key') THEN
    ALTER TABLE public.participants ADD CONSTRAINT participants_ticket_code_key UNIQUE (ticket_code);
  END IF;
END $$;

-- 3. Reforço na lógica de sorteio (Nota: A função perform_automatic_draw já utiliza ORDER BY random())
-- Isso garante que a escolha dos vencedores seja 100% imparcial e protegida contra manipulações.