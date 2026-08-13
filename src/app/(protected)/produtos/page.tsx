import Link from "next/link";
import { Calculator, ChevronRight } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { deleteProduto, duplicarProduto } from "./actions";
import { BotaoExcluir } from "@/components/botao-excluir";

type Produto = {
  id: string;
  nome: string;
  preco_compra: number | string;
  volume_ml: number | string;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function precoPorMl(produto: Produto): number | null {
  const volume = Number(produto.volume_ml);
  if (!volume) return null;
  return Number(produto.preco_compra) / volume;
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Custo de Produtos
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar
          produtos nesta fase.
        </p>
      </div>
    );
  }

  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, nome, preco_compra, volume_ml")
    .eq("empresa_id", usuario.empresa_id)
    .order("nome");

  const lista = (produtos ?? []) as Produto[];

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/ajustes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Custo de Produtos
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Cadastre os produtos usados nos atendimentos e calcule quanto cada
        serviço gasta.
      </p>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <Link
        href="/produtos/calcular"
        className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <Calculator className="h-5 w-5" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Calcular custo de produtos
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Produtos cadastrados
        </h2>
        <Link
          href="/produtos/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Novo produto
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {lista.map((produto) => {
            const porMl = precoPorMl(produto);
            return (
              <div
                key={produto.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <Link
                  href={`/produtos/${produto.id}/editar`}
                  className="flex min-w-0 flex-1 flex-col"
                >
                  <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {produto.nome}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatarMoeda(Number(produto.preco_compra))} ·{" "}
                    {Number(produto.volume_ml)}ml
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {porMl !== null
                      ? `${formatarMoeda(porMl)}/ml`
                      : "Volume inválido"}
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                  <Link
                    href={`/produtos/${produto.id}/editar`}
                    className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                  >
                    Editar
                  </Link>
                  <form action={duplicarProduto}>
                    <input type="hidden" name="id" value={produto.id} />
                    <button
                      type="submit"
                      className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                    >
                      Duplicar
                    </button>
                  </form>
                  <form action={deleteProduto}>
                    <input type="hidden" name="id" value={produto.id} />
                    <BotaoExcluir
                      mensagemConfirmacao={`Excluir ${produto.nome}? Esta ação não pode ser desfeita.`}
                      className="text-sm text-red-600 hover:underline dark:text-red-400"
                    >
                      Excluir
                    </BotaoExcluir>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
