import { CalendarClock, History } from "lucide-react";
import { notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { adicionarMeses } from "@/lib/data-brasil";
import { BotaoVoltar } from "@/components/botao-voltar";
import { EnviarWhatsappPdf } from "@/components/enviar-whatsapp-pdf";
import { MENSAGENS_PADRAO, substituirVariaveis } from "@/lib/mensagens";
import { updateCliente } from "../../actions";
import { ClienteForm } from "../../cliente-form";

export default async function EditarClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { usuario, supabase } = await getUsuarioAtual();

  const { data: cliente } = await supabase
    .from("clientes")
    .select(
      "id, nome, telefone, email, endereco, numero, complemento, bairro, cidade, estado, cep, observacoes, recorrencia_meses",
    )
    .eq("id", id)
    .maybeSingle();

  if (!cliente) {
    notFound();
  }

  const { data: ultimoAtendimento } = await supabase
    .from("agendamentos")
    .select("data")
    .eq("cliente_id", id)
    .eq("status", "concluido")
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();

  const ultimaVisita = ultimoAtendimento?.data as string | undefined;
  const proximaHigienizacao = ultimaVisita
    ? adicionarMeses(ultimaVisita, cliente.recorrencia_meses)
    : null;

  const empresa = usuario?.empresas as unknown as {
    nome: string;
    mensagem_lembrete: string | null;
  } | null;

  const mensagemLembrete = ultimaVisita
    ? substituirVariaveis(
        empresa?.mensagem_lembrete || MENSAGENS_PADRAO.lembrete,
        {
          cliente: cliente.nome,
          empresa: empresa?.nome ?? "",
          data: new Date(`${ultimaVisita}T00:00:00`).toLocaleDateString(
            "pt-BR",
          ),
        },
      )
    : "";

  const updateClienteComId = updateCliente.bind(null, id);

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/clientes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar cliente
        </h1>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <History className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          Última higienização:{" "}
          {ultimaVisita
            ? new Date(`${ultimaVisita}T00:00:00`).toLocaleDateString(
                "pt-BR",
              )
            : "Sem atendimentos registrados"}
        </span>
        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CalendarClock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          Próxima prevista:{" "}
          {proximaHigienizacao
            ? new Date(
                `${proximaHigienizacao}T00:00:00`,
              ).toLocaleDateString("pt-BR")
            : "—"}
        </span>
      </div>

      {ultimaVisita && (
        <div className="mt-3 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Lembrete de próxima higienização
          </span>
          <EnviarWhatsappPdf
            telefone={cliente.telefone}
            mensagemPadrao={mensagemLembrete}
          />
        </div>
      )}

      <ClienteForm
        action={updateClienteComId}
        defaultValues={cliente}
        error={errorParam}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}
