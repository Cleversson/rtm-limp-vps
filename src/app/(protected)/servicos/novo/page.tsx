import { BotaoVoltar } from "@/components/botao-voltar";
import { createServico } from "../actions";
import { ServicoForm } from "../servico-form";

export default async function NovoServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/servicos" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo serviço
        </h1>
      </div>
      <ServicoForm
        action={createServico}
        error={params.error}
        submitLabel="Criar serviço"
      />
    </div>
  );
}
