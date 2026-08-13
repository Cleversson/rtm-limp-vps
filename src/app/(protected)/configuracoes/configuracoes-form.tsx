import { updateEmpresa } from "./actions";
import { LogoField } from "./logo-field";

export type Empresa = {
  id: string;
  nome: string;
  whatsapp: string | null;
  telefone: string | null;
  cnpj: string | null;
  endereco: string | null;
  cidade: string | null;
  instagram: string | null;
  site: string | null;
  email: string | null;
  logo_url: string | null;
  forma_pagamento: string | null;
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

export function ConfiguracoesForm({
  empresa,
  error,
  message,
}: {
  empresa: Empresa;
  error?: string;
  message?: string;
}) {
  return (
    <form
      action={updateEmpresa}
      className="mt-6 flex max-w-xl flex-col gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900 dark:border dark:border-slate-800"
    >
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          {message}
        </p>
      )}

      <LogoField logoUrl={empresa.logo_url} />

      <Field label="Nome da empresa">
        <input
          name="nome"
          defaultValue={empresa.nome}
          required
          className={inputClass}
        />
      </Field>
      <Field label="E-mail">
        <input
          name="email"
          type="email"
          defaultValue={empresa.email ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="WhatsApp">
        <input
          name="whatsapp"
          defaultValue={empresa.whatsapp ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Telefone">
        <input
          name="telefone"
          defaultValue={empresa.telefone ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="CNPJ">
        <input
          name="cnpj"
          defaultValue={empresa.cnpj ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Endereço">
        <input
          name="endereco"
          defaultValue={empresa.endereco ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Cidade">
        <input
          name="cidade"
          defaultValue={empresa.cidade ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Instagram">
        <input
          name="instagram"
          defaultValue={empresa.instagram ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Site">
        <input
          name="site"
          defaultValue={empresa.site ?? ""}
          className={inputClass}
        />
      </Field>
      <Field label="Formas de pagamento aceitas">
        <input
          name="forma_pagamento"
          defaultValue={empresa.forma_pagamento ?? ""}
          placeholder="Ex: PIX, cartão de crédito/débito, dinheiro"
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        className="mt-2 rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        Salvar
      </button>
    </form>
  );
}
