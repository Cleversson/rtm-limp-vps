import { BotaoVoltar } from "@/components/botao-voltar";
import { createCliente } from "../actions";
import { ClienteForm } from "../cliente-form";

export default async function NovoClientePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/clientes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo cliente
        </h1>
      </div>
      <ClienteForm
        action={createCliente}
        error={params.error}
        submitLabel="Criar cliente"
      />
    </div>
  );
}
