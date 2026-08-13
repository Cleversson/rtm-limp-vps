alter table transacoes add column forma_pagamento text;

create table assinaturas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  imagem_url text not null,
  created_at timestamptz not null default now()
);

alter table assinaturas enable row level security;
grant select, insert, update, delete on assinaturas to authenticated;

create policy "cliente gerencia assinaturas da propria empresa, admin gerencia todos"
  on assinaturas for all
  using (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin())
  with check (empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin());

alter table transacoes add column assinatura_id uuid references assinaturas(id) on delete set null;
