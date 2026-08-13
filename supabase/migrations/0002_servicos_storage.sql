-- Grants que faltaram na migration da Fase 1 (idempotente — corrige o que já
-- foi aplicado manualmente no SQL Editor, documentando no repositório).
grant select, insert, update on empresas to authenticated;
grant select on usuarios to authenticated;

create table servicos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria text,
  preco numeric(10,2) not null,
  duracao_minutos integer,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table servicos enable row level security;
grant select, insert, update, delete on servicos to authenticated;

create policy "cliente gerencia servicos da propria empresa, admin gerencia todos"
  on servicos for all
  using (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  )
  with check (
    empresa_id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );

-- Storage: bucket público de leitura pra logos, upload restrito à própria empresa
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "leitura publica dos logos"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "cliente sobe logo da propria empresa"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );

create policy "cliente atualiza logo da propria empresa"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );
