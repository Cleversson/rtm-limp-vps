create type status_orcamento as enum ('pendente', 'aprovado', 'concluido');

create table orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero bigserial,
  empresa_id uuid not null references empresas(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  status status_orcamento not null default 'pendente',
  desconto numeric(10,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table orcamentos enable row level security;
grant select, insert, update, delete on orcamentos to authenticated;

create policy "cliente gerencia orcamentos da propria empresa, admin gerencia todos"
  on orcamentos for all
  using (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin())
  with check (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin());

create table orcamento_itens (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references orcamentos(id) on delete cascade,
  servico_id uuid references servicos(id) on delete set null,
  nome text not null,
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table orcamento_itens enable row level security;
grant select, insert, update, delete on orcamento_itens to authenticated;

create policy "cliente gerencia itens dos proprios orcamentos, admin gerencia todos"
  on orcamento_itens for all
  using (
    orcamento_id in (select id from orcamentos where empresa_id = (select empresa_id from usuarios where id = auth.uid()))
    or public.is_admin()
  )
  with check (
    orcamento_id in (select id from orcamentos where empresa_id = (select empresa_id from usuarios where id = auth.uid()))
    or public.is_admin()
  );

insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do nothing;

create policy "leitura publica dos documentos"
  on storage.objects for select
  using (bucket_id = 'documentos');

create policy "cliente sobe documentos da propria empresa"
  on storage.objects for insert
  with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );

create policy "cliente atualiza documentos da propria empresa"
  on storage.objects for update
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );
