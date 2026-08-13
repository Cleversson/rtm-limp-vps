create type categoria_transacao as enum (
  'servico_prestado',
  'produtos',
  'combustivel',
  'marketing',
  'manutencao_equipamento',
  'aluguel',
  'outros'
);

-- Migra os dados existentes (texto livre) pro enum, com melhor esforço;
-- qualquer valor não reconhecido cai em 'outros'.
alter table transacoes add column categoria_nova categoria_transacao;

update transacoes
set categoria_nova = case
  when lower(categoria) like '%servi%' then 'servico_prestado'
  when lower(categoria) like '%produt%' then 'produtos'
  when lower(categoria) like '%combust%' or lower(categoria) like '%gasolina%' then 'combustivel'
  when lower(categoria) like '%marketing%' or lower(categoria) like '%anunci%' then 'marketing'
  when lower(categoria) like '%manuten%' or lower(categoria) like '%equipamento%' then 'manutencao_equipamento'
  when lower(categoria) like '%aluguel%' then 'aluguel'
  else 'outros'
end::categoria_transacao;

alter table transacoes drop column categoria;
alter table transacoes rename column categoria_nova to categoria;
alter table transacoes alter column categoria set not null;
alter table transacoes alter column categoria set default 'outros';
