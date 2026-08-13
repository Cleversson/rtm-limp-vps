create type tipo_transacao as enum ('entrada', 'saida');

create table transacoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  tipo tipo_transacao not null,
  descricao text not null,
  categoria text,
  valor numeric(10,2) not null,
  data date not null,
  cliente_id uuid references clientes(id) on delete set null,
  agendamento_id uuid references agendamentos(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table transacoes enable row level security;
grant select, insert, update, delete on transacoes to authenticated;

create policy "cliente gerencia transacoes da propria empresa, admin gerencia todos"
  on transacoes for all
  using (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  )
  with check (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );
