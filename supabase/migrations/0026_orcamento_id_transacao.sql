alter table transacoes add column orcamento_id uuid references orcamentos(id) on delete set null;
