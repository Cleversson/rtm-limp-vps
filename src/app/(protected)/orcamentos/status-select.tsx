"use client";

import { useRef, useState } from "react";
import { STATUS_ORCAMENTO_OPTIONS } from "@/lib/orcamento";

export function StatusOrcamentoSelect({
  id,
  status,
  action,
}: {
  id: string;
  status: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [statusSelecionado, setStatusSelecionado] = useState(status);
  const [mostrarMotivo, setMostrarMotivo] = useState(false);

  function handleChange(novoStatus: string) {
    setStatusSelecionado(novoStatus);
    if (novoStatus === "cancelado") {
      setMostrarMotivo(true);
    } else {
      setMostrarMotivo(false);
      formRef.current?.requestSubmit();
    }
  }

  function handleVoltar() {
    setStatusSelecionado(status);
    setMostrarMotivo(false);
  }

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Status do orçamento
        <select
          name="status"
          value={statusSelecionado}
          onChange={(e) => handleChange(e.target.value)}
          className="h-12 rounded-lg border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
        >
          {STATUS_ORCAMENTO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      {mostrarMotivo && (
        <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-500/10">
          <label className="flex flex-col gap-1 text-sm font-medium text-red-700 dark:text-red-400">
            Motivo do cancelamento
            <textarea
              name="motivo_cancelamento"
              required
              rows={2}
              className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 dark:border-red-900/50 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
            >
              Confirmar cancelamento
            </button>
            <button
              type="button"
              onClick={handleVoltar}
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Voltar
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
