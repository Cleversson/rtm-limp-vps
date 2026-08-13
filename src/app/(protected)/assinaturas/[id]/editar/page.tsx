import { notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { deleteAssinatura, updateAssinatura } from "../../actions";
import { AssinaturaForm } from "../../assinatura-form";
import { BotaoExcluir } from "@/components/botao-excluir";

export default async function EditarAssinaturaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { supabase } = await getUsuarioAtual();

  const { data: assinatura } = await supabase
    .from("assinaturas")
    .select("id, nome, imagem_url")
    .eq("id", id)
    .maybeSingle();

  if (!assinatura) {
    notFound();
  }

  const updateAssinaturaComId = updateAssinatura.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/assinaturas" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar assinatura
        </h1>
      </div>
      <AssinaturaForm
        action={updateAssinaturaComId}
        defaultValues={assinatura}
        error={errorParam}
        submitLabel="Salvar alterações"
      />

      <form action={deleteAssinatura} className="mt-4">
        <input type="hidden" name="id" value={assinatura.id} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir ${assinatura.nome}? Esta ação não pode ser desfeita.`}
          className="h-12 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Excluir assinatura
        </BotaoExcluir>
      </form>
    </div>
  );
}
