import { BotaoVoltar } from "@/components/botao-voltar";
import { createAssinatura } from "../actions";
import { AssinaturaForm } from "../assinatura-form";

export default async function NovaAssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/assinaturas" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Nova assinatura
        </h1>
      </div>
      <AssinaturaForm
        action={createAssinatura}
        error={error}
        submitLabel="Cadastrar assinatura"
      />
    </div>
  );
}
