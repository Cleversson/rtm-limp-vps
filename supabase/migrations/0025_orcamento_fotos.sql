create table orcamento_fotos (
  id uuid primary key default gen_random_uuid(),
  orcamento_id uuid not null references orcamentos(id) on delete cascade,
  path text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table orcamento_fotos enable row level security;
grant select, insert, delete on orcamento_fotos to authenticated;
grant select on orcamento_fotos to service_role;

create policy "cliente gerencia fotos dos proprios orcamentos, admin gerencia todos"
  on orcamento_fotos for all
  using (
    orcamento_id in (select id from orcamentos where empresa_id = (select empresa_id from usuarios where id = auth.uid()))
    or public.is_admin()
  )
  with check (
    orcamento_id in (select id from orcamentos where empresa_id = (select empresa_id from usuarios where id = auth.uid()))
    or public.is_admin()
  );
