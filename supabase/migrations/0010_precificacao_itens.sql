alter table empresas add column custos_fixos_itens jsonb;
alter table empresas add column taxa_pix_padrao numeric(5,2);

-- Migra os valores únicos da Fase 6 original pra itens da lista nova,
-- em vez de descartar o que já foi salvo em teste.
update empresas
set custos_fixos_itens = (
  select jsonb_agg(item) from (
    select jsonb_build_object('nome', 'Custos fixos', 'valor', custos_fixos_mensais) as item
    where custos_fixos_mensais is not null and custos_fixos_mensais > 0
    union all
    select jsonb_build_object('nome', 'Pró-labore', 'valor', prolabore_desejado)
    where prolabore_desejado is not null and prolabore_desejado > 0
  ) sub
)
where coalesce(custos_fixos_mensais, 0) > 0 or coalesce(prolabore_desejado, 0) > 0;

alter table empresas drop column custos_fixos_mensais;
alter table empresas drop column prolabore_desejado;
