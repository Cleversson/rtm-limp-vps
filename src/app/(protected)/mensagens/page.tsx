import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { MensagensForm } from "./mensagens-form";

export default async function MensagensPage({
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
            Mensagens
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para configurar
          mensagens nesta fase.
        </p>
      </div>
    );
  }

  const empresa = usuario.empresas as unknown as {
    mensagem_orcamento: string | null;
    mensagem_recibo: string | null;
    mensagem_lembrete: string | null;
    mensagem_confirmacao: string | null;
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/ajustes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Mensagens
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Personalize os textos padrão enviados por WhatsApp. Você pode editar
        cada mensagem antes de enviar, mesmo depois de salvar aqui.
      </p>

      <MensagensForm
        defaultValues={{
          mensagem_orcamento: empresa.mensagem_orcamento,
          mensagem_recibo: empresa.mensagem_recibo,
          mensagem_lembrete: empresa.mensagem_lembrete,
          mensagem_confirmacao: empresa.mensagem_confirmacao,
        }}
        error={params.error}
        message={params.message}
      />
    </div>
  );
}
