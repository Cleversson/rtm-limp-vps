"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";

export type ProdutoResumo = {
  id: string;
  nome: string;
  preco_compra: number;
  volume_ml: number;
};

type LinhaUso = {
  id: string;
  produtoId: string;
  mlUsado: string;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function precoPorMl(produto: ProdutoResumo | undefined): number {
  if (!produto || !produto.volume_ml) return 0;
  return produto.preco_compra / produto.volume_ml;
}

function novaLinha(produtoIdPadrao: string): LinhaUso {
  return { id: crypto.randomUUID(), produtoId: produtoIdPadrao, mlUsado: "" };
}

export function CalcularCustoForm({ produtos }: { produtos: ProdutoResumo[] }) {
  const [linhas, setLinhas] = useState<LinhaUso[]>([novaLinha(produtos[0]?.id ?? "")]);

  const produtosById = Object.fromEntries(produtos.map((p) => [p.id, p]));

  function atualizarLinha(id: string, campo: "produtoId" | "mlUsado", valor: string) {
    setLinhas((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)),
    );
  }

  function removerLinha(id: string) {
    setLinhas((prev) => prev.filter((l) => l.id !== id));
  }

  function adicionarLinha() {
    setLinhas((prev) => [...prev, novaLinha(produtos[0]?.id ?? "")]);
  }

  const itensComCusto = linhas
    .map((l) => {
      const produto = produtosById[l.produtoId];
      const ml = Number(l.mlUsado) || 0;
      const custo = ml * precoPorMl(produto);
      return { linha: l, produto, ml, custo };
    })
    .filter((item) => item.produto && item.ml > 0);

  const total = itensComCusto.reduce((s, i) => s + i.custo, 0);

  const hrefPrecificacao = `/precificacao?produtos=${encodeURIComponent(
    JSON.stringify(
      itensComCusto.map((i) => ({ nome: i.produto!.nome, valor: i.custo })),
    ),
  )}`;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Produtos usados neste atendimento
        </span>

        {linhas.map((linha) => {
          const produto = produtosById[linha.produtoId];
          const ml = Number(linha.mlUsado) || 0;
          const custo = ml * precoPorMl(produto);

          return (
            <div
              key={linha.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-2">
                <select
                  value={linha.produtoId}
                  onChange={(e) => atualizarLinha(linha.id, "produtoId", e.target.value)}
                  className="min-w-0 flex-1 rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removerLinha(linha.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  aria-label="Remover produto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={linha.mlUsado}
                  onChange={(e) => atualizarLinha(linha.id, "mlUsado", e.target.value)}
                  placeholder="ml usado"
                  className="w-32 rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
                />
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  ml usado
                </span>
                <span className="ml-auto text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatarMoeda(custo)}
                </span>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={adicionarLinha}
          className="mt-1 flex items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Adicionar produto
        </button>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          Total gasto com produtos
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatarMoeda(total)}
        </span>
      </div>

      <Link
        href={hrefPrecificacao}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        Usar na Precificação
      </Link>
    </div>
  );
}
