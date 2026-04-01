-- Destrava salas presas em 'processing' ou 'open' que já deveriam ter sido sorteadas
UPDATE rooms 
SET status = 'open' 
WHERE status = 'processing';

-- Garante que o status 'processing' não impeça novas tentativas se o tempo expirou
UPDATE rooms 
SET status = 'open' 
WHERE expires_at <= NOW() AND status != 'finished';

-- Opcional: Limpa salas sem participantes que ficaram perdidas
DELETE FROM rooms WHERE current_participants = 0 AND status = 'finished';