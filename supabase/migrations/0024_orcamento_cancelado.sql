alter type status_orcamento add value if not exists 'cancelado';
alter table orcamentos add column motivo_cancelamento text;
