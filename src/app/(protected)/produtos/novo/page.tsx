import { BotaoVoltar } from "@/components/botao-voltar";
import { createProduto } from "../actions";
import { ProdutoForm } from "../produto-form";

export default async function NovoProdutoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/produtos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo produto
        </h1>
      </div>
      <ProdutoForm
        action={createProduto}
        error={error}
        submitLabel="Cadastrar produto"
      />
    </div>
  );
}
