import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { calcularPrecificacao } from "../formula";
import { salvarComoServico } from "../actions";

function numero(value: string | undefined): number {
  return Number(value ?? "0") || 0;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function ResultadoPrecificacaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    totalFixos?: string;
    horas?: string;
    totalVariaveis?: string;
    duracao?: string;
    margem?: string;
    taxaMaquininha?: string;
    taxaPix?: string;
  }>;
}) {
  const params = await searchParams;
  await getUsuarioAtual();

  const input = {
    totalFixos: numero(params.totalFixos),
    horas: numero(params.horas),
    totalVariaveis: numero(params.totalVariaveis),
    duracao: numero(params.duracao),
    margem: numero(params.margem),
    taxaMaquininha: numero(params.taxaMaquininha),
    taxaPix: numero(params.taxaPix),
  };

  const resultado = calcularPrecificacao(input);

  return (
    <div>
      <BotaoVoltar href="/precificacao" />
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Cálculo Concluído
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Preço sugerido baseado nos seus parâmetros.
        </p>
      </div>

      <div className="mt-6 rounded-xl border-l-4 border-l-emerald-500 border-y border-r border-slate-200 bg-white p-6 shadow-sm dark:border-y-slate-800 dark:border-r-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          Preço Ideal do Serviço
        </p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {formatarMoeda(resultado.precoFinal)}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Custo da Hora
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatarMoeda(resultado.custoHora)}/h
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Custo Operacional
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {formatarMoeda(resultado.custoOperacional)}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Margem + Taxas aplicadas
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {input.margem}% + {input.taxaMaquininha}% + {input.taxaPix}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Lucro Líquido
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(resultado.lucro)}
          </span>
        </div>
      </div>

      <form
        action={salvarComoServico}
        className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <input type="hidden" name="preco" value={resultado.precoFinal} />
        <input type="hidden" name="duracao" value={input.duracao} />
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          Nome do serviço
          <input
            name="nome"
            required
            placeholder="Ex: Higienização de sofá 3 lugares"
            className="h-12 rounded-lg border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
          />
        </label>
        <button
          type="submit"
          className="h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Salvar como novo serviço
        </button>
      </form>

      <Link
        href="/precificacao"
        className="mt-3 flex h-12 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Novo Cálculo
      </Link>
    </div>
  );
}
