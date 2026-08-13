import { notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { updateServico } from "../../actions";
import { ServicoForm } from "../../servico-form";

export default async function EditarServicoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { supabase } = await getUsuarioAtual();

  const { data: servico } = await supabase
    .from("servicos")
    .select("id, nome, descricao, categoria, preco, duracao_minutos")
    .eq("id", id)
    .maybeSingle();

  if (!servico) {
    notFound();
  }

  const updateServicoComId = updateServico.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/servicos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar serviço
        </h1>
      </div>
      <ServicoForm
        action={updateServicoComId}
        defaultValues={servico}
        error={errorParam}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
