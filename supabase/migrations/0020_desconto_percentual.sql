alter table orcamentos add column desconto_tipo text not null default 'fixo'
  check (desconto_tipo in ('fixo', 'percentual'));
