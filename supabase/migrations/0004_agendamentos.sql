create type status_agendamento as enum ('agendado', 'confirmado', 'pendente');

create table agendamentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  cliente_id uuid not null references clientes(id) on delete cascade,
  servico_id uuid references servicos(id) on delete set null,
  data date not null,
  hora_inicio time not null,
  hora_fim time,
  endereco text,
  numero text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  status status_agendamento not null default 'agendado',
  observacoes text,
  created_at timestamptz not null default now()
);

alter table agendamentos enable row level security;
grant select, insert, update, delete on agendamentos to authenticated;

create policy "cliente gerencia agendamentos da propria empresa, admin gerencia todos"
  on agendamentos for all
  using (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  )
  with check (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );
