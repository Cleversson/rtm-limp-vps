"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";

export type ItemPersistido = { nome: string; valor: number | string };

export type CalculadoraDefaultValues = {
  custosFixos?: ItemPersistido[] | null;
  horas?: number | string | null;
  margem?: number | string | null;
  taxaMaquininha?: number | string | null;
  taxaPix?: number | string | null;
};

type ItemCusto = {
  id: string;
  nome: string;
  valor: string;
};

const TOTAL_PASSOS = 4;

const LABELS_PASSO = [
  "Custos Fixos",
  "Valor da Hora",
  "Custos Variáveis",
  "Margem de Lucro",
];

const inputBaseClass =
  "h-12 rounded-lg border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20";
const inputClass = `${inputBaseClass} w-full`;

function novoItem(nome = "", valor = ""): ItemCusto {
  return { id: crypto.randomUUID(), nome, valor };
}

function somaItens(itens: ItemCusto[]): number {
  return itens.reduce((s, i) => s + (Number(i.valor) || 0), 0);
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

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

function ListaCustos({
  itens,
  onChange,
  nomeCampoNome,
  nomeCampoValor,
  placeholderNome,
}: {
  itens: ItemCusto[];
  onChange: (itens: ItemCusto[]) => void;
  nomeCampoNome: string;
  nomeCampoValor: string;
  placeholderNome: string;
}) {
  function atualizarItem(id: string, campo: "nome" | "valor", valor: string) {
    onChange(itens.map((i) => (i.id === id ? { ...i, [campo]: valor } : i)));
  }

  function removerItem(id: string) {
    onChange(itens.filter((i) => i.id !== id));
  }

  function adicionarItem() {
    onChange([...itens, novoItem()]);
  }

  const total = somaItens(itens);

  return (
    <div className="flex flex-col gap-2">
      {itens.length === 0 && (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Nenhum custo adicionado ainda.
        </p>
      )}
      {itens.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            name={nomeCampoNome}
            value={item.nome}
            onChange={(e) => atualizarItem(item.id, "nome", e.target.value)}
            placeholder={placeholderNome}
            className={`${inputBaseClass} min-w-0 flex-1`}
          />
          <input
            name={nomeCampoValor}
            type="number"
            step="0.01"
            min="0"
            value={item.valor}
            onChange={(e) => atualizarItem(item.id, "valor", e.target.value)}
            placeholder="R$"
            className={`${inputBaseClass} w-28 shrink-0`}
          />
          <button
            type="button"
            onClick={() => removerItem(item.id)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            aria-label="Remover custo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={adicionarItem}
        className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Adicionar custo
      </button>

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Total
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatarMoeda(total)}
        </span>
      </div>
    </div>
  );
}

export function CalculadoraForm({
  action,
  defaultValues,
  error,
  itensVariaveisIniciais,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: CalculadoraDefaultValues;
  error?: string;
  itensVariaveisIniciais?: ItemPersistido[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [passo, setPasso] = useState(1);

  const [custosFixos, setCustosFixos] = useState<ItemCusto[]>(() => {
    const salvos = defaultValues?.custosFixos;
    if (salvos && salvos.length > 0) {
      return salvos.map((i) => novoItem(i.nome, String(i.valor)));
    }
    return [novoItem()];
  });
  const [horas, setHoras] = useState(String(defaultValues?.horas ?? ""));
  const [custosVariaveis, setCustosVariaveis] = useState<ItemCusto[]>(() => {
    if (itensVariaveisIniciais && itensVariaveisIniciais.length > 0) {
      return itensVariaveisIniciais.map((i) => novoItem(i.nome, String(i.valor)));
    }
    return [novoItem()];
  });
  const [duracao, setDuracao] = useState("");
  const [margem, setMargem] = useState(String(defaultValues?.margem ?? ""));
  const [taxaMaquininha, setTaxaMaquininha] = useState(
    String(defaultValues?.taxaMaquininha ?? ""),
  );
  const [taxaPix, setTaxaPix] = useState(String(defaultValues?.taxaPix ?? ""));

  const totalFixos = somaItens(custosFixos);
  const custoHora = Number(horas) > 0 ? totalFixos / Number(horas) : 0;

  const progresso = Math.round((passo / TOTAL_PASSOS) * 100);

  function secaoClasse(numeroPasso: number) {
    return passo === numeroPasso ? "block" : "hidden";
  }

  function proximoOuFinalizar() {
    if (passo < TOTAL_PASSOS) {
      setPasso((p) => p + 1);
    } else {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={action} className="mt-4">
      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mb-6">
        <div className="mb-2 flex justify-between text-xs font-medium">
          <span className="uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Passo {passo} de {TOTAL_PASSOS}: {LABELS_PASSO[passo - 1]}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {progresso}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className={secaoClasse(1)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Custos Fixos Mensais
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Adicione cada custo que sua empresa tem independente de realizar
          serviços (pró-labore, aluguel, internet, software etc).
        </p>
        <div className="mt-4">
          <ListaCustos
            itens={custosFixos}
            onChange={setCustosFixos}
            nomeCampoNome="custoFixoNome"
            nomeCampoValor="custoFixoValor"
            placeholderNome="Ex: Pró-labore, Aluguel"
          />
        </div>
      </div>

      <div className={secaoClasse(2)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Valor da Hora
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quantas horas você pretende trabalhar por mês.
        </p>
        <div className="mt-4">
          <Field label="Horas trabalhadas por mês">
            <input
              name="horas"
              type="number"
              step="0.5"
              min="0"
              placeholder="ex: 160"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              className={inputClass}
            />
          </Field>
          <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Valor da hora calculado:{" "}
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {formatarMoeda(custoHora)}/h
            </span>
          </p>
        </div>
      </div>

      <div className={secaoClasse(3)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Custos Variáveis do Serviço
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Custos específicos deste serviço — cada um do seu jeito (produtos,
          deslocamento, ajudante etc).
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <ListaCustos
            itens={custosVariaveis}
            onChange={setCustosVariaveis}
            nomeCampoNome="custoVariavelNome"
            nomeCampoValor="custoVariavelValor"
            placeholderNome="Ex: Produtos, Deslocamento"
          />
          <Field label="Tempo estimado (horas)">
            <input
              name="duracao"
              type="number"
              step="0.5"
              min="0"
              placeholder="ex: 4"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className={secaoClasse(4)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Margem de Lucro e Taxas
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Porcentagem de lucro líquido desejada e as taxas descontadas por
          maquininha e PIX.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Margem de lucro desejada (%)">
            <input
              name="margem"
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 25"
              value={margem}
              onChange={(e) => setMargem(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Taxa da maquininha (%)">
            <input
              name="taxaMaquininha"
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 3"
              value={taxaMaquininha}
              onChange={(e) => setTaxaMaquininha(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Taxa PIX (%)">
            <input
              name="taxaPix"
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 1"
              value={taxaPix}
              onChange={(e) => setTaxaPix(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        {passo > 1 && (
          <button
            type="button"
            onClick={() => setPasso((p) => p - 1)}
            className="h-12 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Voltar
          </button>
        )}
        <button
          type="button"
          onClick={proximoOuFinalizar}
          className="h-12 flex-2 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          {passo < TOTAL_PASSOS ? "Próximo Passo" : "Finalizar Cálculo"}
        </button>
      </div>
    </form>
  );
}
