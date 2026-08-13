import Link from "next/link";
import {
  ChevronRight,
  FileText,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import {
  MESES,
  hojeBrasilia,
  mesAdjacente,
  pad2,
  primeiroEUltimoDia,
} from "@/lib/data-brasil";
import { resolverPeriodo, type PeriodoSearchParams } from "@/lib/periodo";
import { PeriodoSeletor } from "@/components/periodo-seletor";
import { GraficoComparativo, type PontoComparativo } from "./grafico-comparativo";
import { GraficoPizza, type FatiaPizza } from "./grafico-pizza";
import { CATEGORIA_LABEL } from "./categorias";

type Transacao = {
  id: string;
  tipo: string;
  descricao: string;
  categoria: string | null;
  valor: number | string;
  data: string;
  cliente_id: string | null;
};

function formatarMoeda(valor: number | string): string {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<PeriodoSearchParams & { error?: string }>;
}) {
  const params = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Financeiro
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar o
          financeiro nesta fase.
        </p>
      </div>
    );
  }

  const hoje = hojeBrasilia();
  const periodo = resolverPeriodo(params, hoje);

  // O gráfico comparativo (6 meses) fica sempre ancorado no mês calendário
  // atual, independente do período navegado acima — uma janela de "6 meses"
  // não tem um mapeamento natural quando o período selecionado é
  // Semanal/Quinzenal/Personalizado.
  const [anoHoje, mesHoje] = hoje.split("-").map(Number);
  const inicioJanela = mesAdjacente(anoHoje, mesHoje, -5);
  const { primeiro: primeiroJanela } = primeiroEUltimoDia(
    inicioJanela.ano,
    inicioJanela.mes,
  );
  const { ultimo: ultimoJanela } = primeiroEUltimoDia(anoHoje, mesHoje);

  const [{ data: transacoesDoMes }, { data: transacoesJanela }] =
    await Promise.all([
      supabase
        .from("transacoes")
        .select("id, tipo, descricao, categoria, valor, data, cliente_id")
        .eq("empresa_id", usuario.empresa_id)
        .gte("data", periodo.inicio)
        .lte("data", periodo.fim)
        .order("data", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("transacoes")
        .select("tipo, data, valor")
        .eq("empresa_id", usuario.empresa_id)
        .gte("data", primeiroJanela)
        .lte("data", ultimoJanela),
    ]);

  const lista = (transacoesDoMes ?? []) as unknown as Transacao[];

  const entradas = lista.filter((t) => t.tipo === "entrada");
  const saidas = lista.filter((t) => t.tipo === "saida");
  const totalEntradas = entradas.reduce((s, t) => s + Number(t.valor), 0);
  const totalSaidas = saidas.reduce((s, t) => s + Number(t.valor), 0);
  const lucroLiquido = totalEntradas - totalSaidas;
  const ticketMedio = entradas.length > 0 ? totalEntradas / entradas.length : 0;

  const somaEntradasPorMes = new Map<string, number>();
  const somaSaidasPorMes = new Map<string, number>();
  for (const t of transacoesJanela ?? []) {
    const chave = (t.data as string).slice(0, 7);
    const mapa = t.tipo === "entrada" ? somaEntradasPorMes : somaSaidasPorMes;
    mapa.set(chave, (mapa.get(chave) ?? 0) + Number(t.valor));
  }

  const dadosComparativo: PontoComparativo[] = [];
  for (let i = 5; i >= 0; i--) {
    const { ano: a, mes: m } = mesAdjacente(anoHoje, mesHoje, -i);
    const chave = `${a}-${pad2(m)}`;
    dadosComparativo.push({
      mesLabel: MESES[m - 1].slice(0, 3),
      entradas: somaEntradasPorMes.get(chave) ?? 0,
      saidas: somaSaidasPorMes.get(chave) ?? 0,
    });
  }

  const somaDespesasPorCategoria = new Map<string, number>();
  for (const t of saidas) {
    somaDespesasPorCategoria.set(
      t.categoria ?? "outros",
      (somaDespesasPorCategoria.get(t.categoria ?? "outros") ?? 0) +
        Number(t.valor),
    );
  }
  const despesasPorCategoria: FatiaPizza[] = Array.from(
    somaDespesasPorCategoria.entries(),
  ).map(([categoria, valor]) => ({ categoria, valor }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Financeiro
      </h1>

      {params.error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {params.error}
        </p>
      )}

      <Link
        href="/orcamentos"
        className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <FileText className="h-5 w-5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Orçamentos
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </Link>

      <PeriodoSeletor periodo={periodo} basePath="/financeiro" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Entradas
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(totalEntradas)}
          </span>
        </div>
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Saídas
          </span>
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatarMoeda(totalSaidas)}
          </span>
        </div>
        {/* Card "hero" — já é escuro no tema claro de propósito, pra se
            destacar dos outros 3; no escuro ganha um tom mais claro
            (slate-800) que os outros cards (slate-900), preservando o
            mesmo contraste relativo de "se destaca por ser diferente". */}
        <div className="flex h-28 flex-col justify-between rounded-xl bg-slate-900 p-4 shadow-sm dark:bg-slate-800">
          <span className="text-xs font-medium text-slate-300">
            Lucro Líquido
          </span>
          <span className="text-lg font-bold text-white">
            {formatarMoeda(lucroLiquido)}
          </span>
        </div>
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Ticket Médio
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatarMoeda(ticketMedio)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <GraficoComparativo dados={dadosComparativo} />
        <GraficoPizza fatias={despesasPorCategoria} />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Transações do período
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lista.length}
          </span>
        </div>

        {lista.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Nenhuma transação neste período.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map((t) => {
              const entrada = t.tipo === "entrada";
              const temRecibo = entrada && t.cliente_id;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <Link
                    href={`/financeiro/${t.id}/editar`}
                    className="flex min-w-0 flex-1 items-center gap-3 active:scale-[0.98]"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                        entrada
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {entrada ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                        {t.descricao}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(
                          `${t.data}T00:00:00`,
                        ).toLocaleDateString("pt-BR")}
                        {t.categoria
                          ? ` • ${CATEGORIA_LABEL[t.categoria] ?? t.categoria}`
                          : ""}
                      </span>
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center gap-2">
                    {temRecibo && (
                      <a
                        href={`/api/recibos/${t.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Recibo
                      </a>
                    )}
                    <span
                      className={`font-bold ${
                        entrada
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {entrada ? "+ " : "- "}
                      {formatarMoeda(t.valor)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Link
        href={`/financeiro/novo?data=${periodo.inicio}`}
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-90 dark:bg-slate-700"
        aria-label="Nova transação"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
