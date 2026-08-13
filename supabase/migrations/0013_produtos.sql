create table produtos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  preco_compra numeric(10,2) not null,
  volume_ml numeric(10,2) not null,
  created_at timestamptz not null default now()
);

alter table produtos enable row level security;
grant select, insert, update, delete on produtos to authenticated;

create policy "cliente gerencia produtos da propria empresa, admin gerencia todos"
  on produtos for all
  using (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin())
  with check (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin());
