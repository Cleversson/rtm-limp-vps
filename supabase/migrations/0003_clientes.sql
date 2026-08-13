create table clientes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  telefone text not null,
  email text,
  endereco text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  created_at timestamptz not null default now()
);

alter table clientes enable row level security;
grant select, insert, update, delete on clientes to authenticated;

create policy "cliente gerencia clientes da propria empresa, admin gerencia todos"
  on clientes for all
  using (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  )
  with check (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );
