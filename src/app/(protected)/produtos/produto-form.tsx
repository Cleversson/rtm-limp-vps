export type ProdutoFormValues = {
  nome?: string;
  preco_compra?: number | string;
  volume_ml?: number | string;
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

export function ProdutoForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ProdutoFormValues;
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

      <Field label="Nome do produto">
        <input
          name="nome"
          defaultValue={defaultValues?.nome ?? ""}
          placeholder="Ex: Flotador, Alvejante, Tira Manchas"
          required
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço de compra (R$)">
          <input
            name="preco_compra"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.preco_compra ?? ""}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Volume comprado (ml)">
          <input
            name="volume_ml"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={defaultValues?.volume_ml ?? ""}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
