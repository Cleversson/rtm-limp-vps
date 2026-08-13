export type ServicoFormValues = {
  nome?: string;
  descricao?: string | null;
  categoria?: string | null;
  preco?: number | string;
  duracao_minutos?: number | null;
};

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-400";

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

export function ServicoForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ServicoFormValues;
  error?: string;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
      className="mt-6 flex max-w-lg flex-col gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800"
    >
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <Field label="Nome do serviço">
        <input
          name="nome"
          defaultValue={defaultValues?.nome ?? ""}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Categoria">
        <input
          name="categoria"
          defaultValue={defaultValues?.categoria ?? ""}
          placeholder="Ex: Sofá, Colchão, Poltrona"
          className={inputClass}
        />
      </Field>
      <Field label="Descrição">
        <textarea
          name="descricao"
          defaultValue={defaultValues?.descricao ?? ""}
          rows={3}
          className={inputClass}
        />
      </Field>
      <Field label="Preço (R$)">
        <input
          name="preco"
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultValues?.preco ?? ""}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Duração (minutos)">
        <input
          name="duracao_minutos"
          type="number"
          min="0"
          defaultValue={defaultValues?.duracao_minutos ?? ""}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        className="mt-2 rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
