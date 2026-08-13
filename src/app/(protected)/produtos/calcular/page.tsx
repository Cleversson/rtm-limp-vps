import Link from "next/link";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { CalcularCustoForm, type ProdutoResumo } from "./calcular-custo-form";

export default async function CalcularCustoPage() {
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/produtos" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Calcular custo de produtos
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para usar a
          calculadora nesta fase.
        </p>
      </div>
    );
  }

  const { data: produtos } = await supabase
    .from("produtos")
    .select("id, nome, preco_compra, volume_ml")
    .eq("empresa_id", usuario.empresa_id)
    .order("nome");

  const lista = (produtos ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    preco_compra: Number(p.preco_compra),
    volume_ml: Number(p.volume_ml),
  })) as ProdutoResumo[];

  if (lista.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/produtos" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Calcular custo de produtos
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Cadastre pelo menos um produto antes de calcular o custo de um
          atendimento.
        </p>
        <Link
          href="/produtos/novo"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Cadastrar produto
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/produtos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Calcular custo de produtos
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Informe quanto de cada produto foi usado neste atendimento.
      </p>

      <CalcularCustoForm produtos={lista} />
    </div>
  );
}
