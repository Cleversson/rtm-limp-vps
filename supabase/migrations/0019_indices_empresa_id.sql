-- Índices essenciais em empresa_id nas tabelas de negócio multi-tenant.
-- Foreign key (references) NÃO cria índice automático no Postgres — até
-- agora só existia o índice implícito da primary key em cada tabela, então
-- todo filtro por empresa_id (usado em praticamente toda query do app, e
-- também dentro da própria condição das policies de RLS) fazia varredura
-- completa da tabela. Não muda nenhuma policy nem grant, só acelera a
-- avaliação delas.
--
-- IMPORTANTE — rode cada CREATE INDEX abaixo SEPARADAMENTE (um de cada vez,
-- não cole o arquivo inteiro de uma vez no SQL Editor): CONCURRENTLY não
-- pode rodar dentro de um bloco de transação, e o SQL Editor do Supabase
-- executa múltiplos statements colados juntos como uma transação só. Rodar
-- um por vez evita o erro "CREATE INDEX CONCURRENTLY cannot run inside a
-- transaction block". O "if not exists" torna seguro repetir um statement
-- caso precise rodar de novo.

create index concurrently if not exists idx_clientes_empresa_id
  on clientes (empresa_id);

create index concurrently if not exists idx_servicos_empresa_id
  on servicos (empresa_id);

create index concurrently if not exists idx_agendamentos_empresa_id
  on agendamentos (empresa_id);

create index concurrently if not exists idx_transacoes_empresa_id
  on transacoes (empresa_id);

create index concurrently if not exists idx_orcamentos_empresa_id
  on orcamentos (empresa_id);

create index concurrently if not exists idx_produtos_empresa_id
  on produtos (empresa_id);

create index concurrently if not exists idx_assinaturas_empresa_id
  on assinaturas (empresa_id);
