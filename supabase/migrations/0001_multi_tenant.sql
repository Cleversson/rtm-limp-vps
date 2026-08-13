create extension if not exists "pgcrypto";

create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text,
  telefone text,
  cnpj text,
  endereco text,
  cidade text,
  instagram text,
  site text,
  email text,
  logo_url text,
  created_at timestamptz not null default now()
);

create type user_role as enum ('admin', 'cliente');

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references empresas(id) on delete set null,
  role user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- Função security definer: evita recursão de RLS ao checar role dentro de policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuarios where id = auth.uid() and role = 'admin'
  );
$$;

alter table empresas enable row level security;
alter table usuarios enable row level security;

create policy "cliente ve sua propria empresa, admin ve todas"
  on empresas for select
  using (
    id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );

create policy "cliente edita sua propria empresa, admin edita todas"
  on empresas for update
  using (
    id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  )
  with check (
    id = (select empresa_id from usuarios where id = auth.uid())
    or public.is_admin()
  );

create policy "usuario ve seu proprio registro, admin ve todos"
  on usuarios for select
  using (id = auth.uid() or public.is_admin());

-- Trigger: roda a cada novo usuário criado no Supabase Auth
-- (cobre e-mail/senha e Google, já que ambos inserem em auth.users).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_emails text[] := array['cleverssondantas@gmail.com', 'tiagoband123@gmail.com'];
  nova_empresa_id uuid;
begin
  if new.email = any(admin_emails) then
    insert into public.usuarios (id, role) values (new.id, 'admin');
  else
    insert into public.empresas (nome, email)
    values (coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email)
    returning id into nova_empresa_id;

    insert into public.usuarios (id, empresa_id, role)
    values (new.id, nova_empresa_id, 'cliente');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
