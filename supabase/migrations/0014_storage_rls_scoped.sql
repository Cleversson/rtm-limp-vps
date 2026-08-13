-- As policies de leitura de 'logos'/'documentos' eram "using (bucket_id = 'x')",
-- sem restrição de dono — isso permite listar o bucket inteiro via .list()
-- com a anon key (aviso do Supabase Dashboard: "Clients can list all files").
-- Buckets públicos ignoram RLS na rota de download direto (getPublicUrl),
-- então apertar aqui não afeta os links já compartilhados.
drop policy if exists "leitura publica dos logos" on storage.objects;
drop policy if exists "leitura publica dos documentos" on storage.objects;

create policy "cliente ve os proprios arquivos de logo"
  on storage.objects for select
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );

create policy "cliente ve os proprios documentos"
  on storage.objects for select
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );

-- Faltava policy de delete pra 'logos' (RLS nega por padrão sem policy) —
-- é por isso que "Remover logo" limpava a UI mas nunca apagava o arquivo.
create policy "cliente remove logo da propria empresa"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );

-- 'documentos' não tem nenhuma funcionalidade de exclusão hoje, mas adiciona
-- por simetria/prevenção — evita o mesmo bug se um dia precisarmos apagar PDFs.
create policy "cliente remove documentos da propria empresa"
  on storage.objects for delete
  using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1] = (select empresa_id::text from usuarios where id = auth.uid())
  );
