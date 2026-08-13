-- As rotas públicas de PDF (/api/orcamentos/[id]/pdf, /api/recibos/[transacaoId]/pdf)
-- usam a service role key pra servir um visitante sem sessão. RLS não bloqueia
-- essa role (tem bypassrls), mas o GRANT de nível de tabela continua sendo
-- necessário — mesma lição já documentada pra "authenticated", agora pra
-- "service_role". Só select: essas rotas nunca escrevem nessas tabelas.
grant select on orcamentos to service_role;
grant select on orcamento_itens to service_role;
grant select on empresas to service_role;
grant select on clientes to service_role;
grant select on transacoes to service_role;
