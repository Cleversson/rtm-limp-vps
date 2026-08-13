import Link from "next/link";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { createOrcamento } from "../actions";
import { OrcamentoForm } from "../orcamento-form";

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorParam } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  const [{ data: clientes }, { data: servicos }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome")
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .order("nome"),
    supabase
      .from("servicos")
      .select("id, nome, preco")
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .eq("ativo", true)
      .order("nome"),
  ]);

  if (!clientes || clientes.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/orcamentos" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Novo orçamento
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Cadastre um cliente antes de criar um orçamento.
        </p>
        <Link
          href="/clientes/novo"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Cadastrar cliente
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/orcamentos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo orçamento
        </h1>
      </div>
      <OrcamentoForm
        action={createOrcamento}
        clientes={clientes}
        servicos={servicos ?? []}
        error={errorParam}
        submitLabel="Criar orçamento"
        mostrarUploadFotos
      />
    </div>
  );
}
