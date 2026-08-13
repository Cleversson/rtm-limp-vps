-- A rota pública /api/recibos/[transacaoId]/pdf usa a service role key pra
-- servir um visitante sem sessão (mesma razão documentada em
-- 0012_grants_service_role_pdf.sql). A migration 0017 criou a tabela
-- assinaturas e deu grant só pra "authenticated" (CRUD em /assinaturas),
-- esquecendo o "service_role" que a rota de PDF também precisa pra ler a
-- imagem da assinatura vinculada ao recibo. Só select: essa rota nunca
-- escreve em assinaturas.
grant select on assinaturas to service_role;
