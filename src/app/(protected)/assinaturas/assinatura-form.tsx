import { ImageUploadField } from "@/components/image-upload-field";

export type AssinaturaFormValues = {
  nome?: string;
  imagem_url?: string | null;
};

const inputClass =
  "rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      {children}
    </label>
  );
}

export function AssinaturaForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: AssinaturaFormValues;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="mt-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <Field label="Nome descritivo">
        <input
          name="nome"
          defaultValue={defaultValues?.nome ?? ""}
          placeholder="Ex: Assinatura Viviane"
          required
          className={inputClass}
        />
      </Field>

      <ImageUploadField
        label="Imagem da assinatura"
        fieldName="imagem"
        imagemUrl={defaultValues?.imagem_url ?? null}
        obrigatorio={!defaultValues?.imagem_url}
        ajuda="Tamanho máximo 2MB (a imagem é comprimida automaticamente). Foto ou desenho da assinatura em papel/fundo claro. Aparece só no rodapé do Recibo, não no Orçamento."
      />

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
