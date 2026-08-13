import { notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { deleteProduto, updateProduto } from "../../actions";
import { ProdutoForm } from "../../produto-form";
import { BotaoExcluir } from "@/components/botao-excluir";

export default async function EditarProdutoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { supabase } = await getUsuarioAtual();

  const { data: produto } = await supabase
    .from("produtos")
    .select("id, nome, preco_compra, volume_ml")
    .eq("id", id)
    .maybeSingle();

  if (!produto) {
    notFound();
  }

  const updateProdutoComId = updateProduto.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/produtos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar produto
        </h1>
      </div>
      <ProdutoForm
        action={updateProdutoComId}
        defaultValues={produto}
        error={errorParam}
        submitLabel="Salvar alterações"
      />

      <form action={deleteProduto} className="mt-4">
        <input type="hidden" name="id" value={produto.id} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir ${produto.nome}? Esta ação não pode ser desfeita.`}
          className="h-12 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Excluir produto
        </BotaoExcluir>
      </form>
    </div>
  );
}
