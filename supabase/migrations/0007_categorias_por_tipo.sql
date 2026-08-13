alter type categoria_transacao add value if not exists 'higienizacao_sofa';
alter type categoria_transacao add value if not exists 'higienizacao_colchao';
alter type categoria_transacao add value if not exists 'impermeabilizacao';
alter type categoria_transacao add value if not exists 'lavagem_tapete_carpete';
alter type categoria_transacao add value if not exists 'taxa_deslocamento';
alter type categoria_transacao add value if not exists 'compra_equipamento';
alter type categoria_transacao add value if not exists 'ajudante_terceirizado';
alter type categoria_transacao add value if not exists 'internet_telefone';
alter type categoria_transacao add value if not exists 'taxas_contabilidade';

-- 'servico_prestado' deixa de ser selecionável nos formulários (entrada
-- agora tem 5 categorias específicas de serviço); remapeia linhas antigas.
update transacoes set categoria = 'outros' where categoria = 'servico_prestado';
