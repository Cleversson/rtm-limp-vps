"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { calcularTotalOrcamento, type TipoDesconto } from "@/lib/orcamento";
import { FotosOrcamentoField } from "@/components/fotos-orcamento-field";

export type ClienteResumo = { id: string; nome: string };
export type ServicoResumo = { id: string; nome: string; preco: number | string };

type OrcamentoItemForm = {
  id: string;
  servico_id: string;
  nome: string;
  quantidade: string;
  valor_unitario: string;
};

export type OrcamentoFormValues = {
  cliente_id?: string;
  desconto?: number | string;
  desconto_tipo?: TipoDesconto;
  observacoes?: string | null;
  itens?: {
    servico_id: string | null;
    nome: string;
    quantidade: number;
    valor_unitario: number | string;
  }[];
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

function novoItem(): OrcamentoItemForm {
  return {
    id: crypto.randomUUID(),
    servico_id: "",
    nome: "",
    quantidade: "1",
    valor_unitario: "",
  };
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrcamentoForm({
  action,
  clientes,
  servicos,
  defaultValues,
  error,
  submitLabel,
  mostrarUploadFotos,
}: {
  action: (formData: FormData) => void | Promise<void>;
  clientes: ClienteResumo[];
  servicos: ServicoResumo[];
  defaultValues?: OrcamentoFormValues;
  error?: string;
  submitLabel: string;
  mostrarUploadFotos?: boolean;
}) {
  const [clienteId, setClienteId] = useState(defaultValues?.cliente_id ?? "");
  const [itens, setItens] = useState<OrcamentoItemForm[]>(() => {
    const salvos = defaultValues?.itens;
    if (salvos && salvos.length > 0) {
      return salvos.map((i) => ({
        id: crypto.randomUUID(),
        servico_id: i.servico_id ?? "",
        nome: i.nome,
        quantidade: String(i.quantidade),
        valor_unitario: String(i.valor_unitario),
      }));
    }
    return [novoItem()];
  });
  const [desconto, setDesconto] = useState(String(defaultValues?.desconto ?? "0"));
  const [descontoTipo, setDescontoTipo] = useState<TipoDesconto>(
    defaultValues?.desconto_tipo ?? "fixo",
  );

  const servicosById = Object.fromEntries(servicos.map((s) => [s.id, s]));

  function atualizarItem(
    id: string,
    campo: "nome" | "quantidade" | "valor_unitario",
    valor: string,
  ) {
    setItens((prev) => prev.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  }

  function handleServicoChange(id: string, servicoId: string) {
    const servico = servicosById[servicoId];
    setItens((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              servico_id: servicoId,
              nome: servico ? servico.nome : i.nome,
              valor_unitario: servico ? String(servico.preco) : i.valor_unitario,
            }
          : i,
      ),
    );
  }

  function removerItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function adicionarItem() {
    setItens((prev) => [...prev, novoItem()]);
  }

  const subtotal = itens.reduce(
    (s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valor_unitario) || 0),
    0,
  );
  const total = calcularTotalOrcamento(
    subtotal,
    Number(desconto) || 0,
    descontoTipo,
  );

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

      <Field label="Cliente">
        <select
          name="cliente_id"
          required
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione um cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Itens
        </span>
        {itens.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <select
                value={item.servico_id}
                onChange={(e) => handleServicoChange(item.id, e.target.value)}
                className={`${inputClass} min-w-0 flex-1`}
              >
                <option value="">Item livre</option>
                {servicos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removerItem(item.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                aria-label="Remover item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              name="itemNome"
              value={item.nome}
              onChange={(e) => atualizarItem(item.id, "nome", e.target.value)}
              placeholder="Nome do item"
              required
              className={inputClass}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="itemQuantidade"
                type="number"
                min="1"
                step="1"
                value={item.quantidade}
                onChange={(e) => atualizarItem(item.id, "quantidade", e.target.value)}
                placeholder="Qtd"
                className={inputClass}
              />
              <input
                name="itemValor"
                type="number"
                min="0"
                step="0.01"
                value={item.valor_unitario}
                onChange={(e) => atualizarItem(item.id, "valor_unitario", e.target.value)}
                placeholder="Valor unit. (R$)"
                className={inputClass}
              />
            </div>
            <input type="hidden" name="itemServicoId" value={item.servico_id} />
          </div>
        ))}
        <button
          type="button"
          onClick={adicionarItem}
          className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Adicionar item
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Desconto
        </span>
        <div className="flex gap-2">
          <select
            name="desconto_tipo"
            value={descontoTipo}
            onChange={(e) => setDescontoTipo(e.target.value as TipoDesconto)}
            className={`${inputClass} w-40 shrink-0`}
          >
            <option value="fixo">Valor fixo (R$)</option>
            <option value="percentual">Porcentagem (%)</option>
          </select>
          <input
            name="desconto"
            type="number"
            min="0"
            max={descontoTipo === "percentual" ? "100" : undefined}
            step="0.01"
            value={desconto}
            onChange={(e) => setDesconto(e.target.value)}
            className={`${inputClass} min-w-0 flex-1`}
          />
        </div>
      </div>

      {mostrarUploadFotos && <FotosOrcamentoField />}

      <Field label="Observações">
        <textarea
          name="observacoes"
          rows={3}
          defaultValue={defaultValues?.observacoes ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Total
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatarMoeda(total)}
        </span>
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
