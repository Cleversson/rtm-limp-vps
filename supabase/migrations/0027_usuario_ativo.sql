ALTER TABLE public.usuarios ADD COLUMN ativo boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "usuario ve seu proprio registro, admin ve todos" ON public.usuarios;

CREATE POLICY "usuario ve seu proprio registro, admin ve todos"
ON public.usuarios FOR SELECT
USING (
  (id = auth.uid() AND ativo = true) OR is_admin()
);

GRANT UPDATE ON public.usuarios TO service_role;
