import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { ConfiguracoesForm, type Empresa } from "./configuracoes-form";

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const { usuario } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresas) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Configurações
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para configurar nesta
          fase.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/ajustes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Dados da sua empresa.
      </p>
      <ConfiguracoesForm
        empresa={usuario.empresas as unknown as Empresa}
        error={params.error}
        message={params.message}
      />
    </div>
  );
}
