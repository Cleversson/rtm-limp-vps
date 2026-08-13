"use client";

import { useState } from "react";
import { CATEGORIAS_ENTRADA, CATEGORIAS_SAIDA } from "./categorias";
import { FORMAS_PAGAMENTO } from "@/lib/formasPagamento";

export type ClienteResumo = {
  id: string;
  nome: string;
};

export type AssinaturaResumo = {
  id: string;
  nome: string;
};

export type TransacaoFormValues = {
  tipo?: string;
  descricao?: string;
  categoria?: string | null;
  valor?: number | string;
  data?: string;
  cliente_id?: string | null;
  agendamento_id?: string | null;
  orcamento_id?: string | null;
  forma_pagamento?: string | null;
  assinatura_id?: string | null;
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

export function TransacaoForm({
  action,
  clientes,
  assinaturas,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  clientes: ClienteResumo[];
  assinaturas: AssinaturaResumo[];
  defaultValues?: TransacaoFormValues;
  error?: string;
  submitLabel: string;
}) {
  const [tipo, setTipo] = useState(defaultValues?.tipo ?? "entrada");
  const opcoesCategoria = tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
  const [categoria, setCategoria] = useState(
    defaultValues?.categoria ?? opcoesCategoria[0].value,
  );

  function handleTipoChange(novoTipo: string) {
    setTipo(novoTipo);
    const novasOpcoes =
      novoTipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;
    setCategoria(novasOpcoes[0].value);
  }

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

      {defaultValues?.agendamento_id && (
        <input
          type="hidden"
          name="agendamento_id"
          value={defaultValues.agendamento_id}
        />
      )}

      {defaultValues?.orcamento_id && (
        <input
          type="hidden"
          name="orcamento_id"
          value={defaultValues.orcamento_id}
        />
      )}

      <Field label="Tipo">
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => handleTipoChange(e.target.value)}
          className={inputClass}
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </Field>

      <Field label="Descrição">
        <input
          name="descricao"
          defaultValue={defaultValues?.descricao ?? ""}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Categoria">
        <select
          name="categoria"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={inputClass}
        >
          {opcoesCategoria.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor (R$)">
          <input
            name="valor"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.valor ?? ""}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Data">
          <input
            name="data"
            type="date"
            defaultValue={defaultValues?.data ?? ""}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Cliente (opcional)">
        <select
          name="cliente_id"
          defaultValue={defaultValues?.cliente_id ?? ""}
          className={inputClass}
        >
          <option value="">Nenhum</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Field>

      {tipo === "entrada" && (
        <>
          <Field label="Forma de pagamento recebida (opcional)">
            <select
              name="forma_pagamento"
              defaultValue={defaultValues?.forma_pagamento ?? ""}
              className={inputClass}
            >
              <option value="">Não informado</option>
              {FORMAS_PAGAMENTO.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Assinatura para o recibo (opcional)">
            <select
              name="assinatura_id"
              defaultValue={defaultValues?.assinatura_id ?? ""}
              className={inputClass}
            >
              <option value="">Nenhuma</option>
              {assinaturas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
