# Database Schema - BORA SORTEIAR

Este diretório contém o schema completo do banco de dados para a plataforma de sorteios.

## Arquivos

- `schema.sql` - Schema completo com tabelas, índices, triggers e funções
- `seed.sql` - Scripts de seed e funções utilitárias para desenvolvimento

## Estrutura do Banco de Dados

### Tabelas Principais

1. **modules** - Módulos de jogo (M1, M2, M3, M4, M5, M6)
   - Preço de entrada
   - Número máximo de participantes por sala

2. **rooms** - Salas/mesas de sorteio
   - Cada módulo tem 3 salas automáticas
   - Duração de 3 horas
   - Status: open, closed, processing, finished

3. **participants** - Participantes de cada sala
   - Código de bilhete único
   - Relacionamento usuário-sala

4. **profiles** - Perfil estendido dos usuários
   - Saldo, informações bancárias, estatísticas

5. **transactions** - Histórico financeiro
   - Depósitos e saques
   - Comprovativos

6. **winners** - Vencedores de sorteios
   - Posição (1º, 2º, 3º)
   - Valor do prêmio

7. **notifications** - Notificações do sistema

### Funcionalidades Automáticas

1. **Criação Automática de Salas**: Quando um módulo é criado, 3 salas são automaticamente geradas
2. **Fechamento Automático**: Salas fecham automaticamente quando:
   - Tempo expira (3 horas)
   - Número máximo de participantes é atingido
3. **Sorteio Automático**: Salas fechadas são automaticamente sorteadas
4. **Reabertura Automática**: Após sorteio, uma nova sala é criada para o mesmo módulo
5. **Geração de Códigos**: Códigos de bilhete únicos gerados automaticamente

### Como Usar

1. **Executar o schema**:
   ```sql
   -- No Supabase SQL Editor ou psql
   \i schema.sql
   ```

2. **Resetar salas (para testes)**:
   ```sql
   SELECT reset_all_rooms();
   ```

3. **Ver estatísticas**:
   ```sql
   SELECT get_system_stats();
   ```

4. **Forçar sorteio manual** (se necessário):
   ```sql
   SELECT perform_automatic_draw('room-uuid-aqui');
   ```

### Verificação de Estrutura

Para verificar se todas as salas foram criadas corretamente:

```sql
-- Contar salas por módulo
SELECT 
  m.name as modulo,
  m.price as valor,
  COUNT(r.id) as total_salas,
  COUNT(CASE WHEN r.status = 'open' THEN 1 END) as abertas,
  COUNT(CASE WHEN r.status = 'closed' THEN 1 END) as encerradas,
  COUNT(CASE WHEN r.status = 'processing' THEN 1 END) as processando,
  COUNT(CASE WHEN r.status = 'finished' THEN 1 END) as finalizadas
FROM modules m
LEFT JOIN rooms r ON m.id = r.module_id
GROUP BY m.id, m.name, m.price
ORDER BY m.price;
```

### Monitoramento

A tabela `rooms` pode ser monitorada em tempo real. O campo `expires_at` indica quando a sala será automaticamente fechada.

### Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas básicas incluídas (devem ser adaptadas)
- UUIDs para todos os IDs

### Notas de Produção

1. **Ajustar timezone**: O sistema usa UTC. Ajuste conforme sua localização
2. **Backup**: Configure backups automáticos do banco de dados
3. **Monitoramento**: Monitore a tabela `rooms` para salas presas em 'closed'
4. **Logs**: Considere adicionar logging nas funções críticas
5. **Performance**: Índices já criados para consultas comuns

### Troubleshooting

**Problema**: Salas não são criadas automaticamente
**Solução**: Verificar se o trigger `create_rooms_for_module_trigger` existe

**Problema**: Sorteio não acontece automaticamente
**Solução**: Agendar `check_and_draw_expired_rooms()` via cron job a cada 5 minutos

**Problema**: Código de bilhete duplicado
**Solução**: A função `generate_ticket_code()` tem loop de proteção, mas verifique colisões