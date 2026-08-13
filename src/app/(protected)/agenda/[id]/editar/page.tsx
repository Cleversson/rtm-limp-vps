import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { EnviarWhatsappPdf } from "@/components/enviar-whatsapp-pdf";
import { MENSAGENS_PADRAO, montarMensagemConfirmacao } from "@/lib/mensagens";
import { deleteAgendamento, updateAgendamento } from "../../actions";
import { AgendamentoForm } from "../../agendamento-form";
import { BotaoExcluir } from "@/components/botao-excluir";

export default async function EditarAgendamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { usuario, supabase } = await getUsuarioAtual();

  const { data: agendamento } = await supabase
    .from("agendamentos")
    .select(
      "id, cliente_id, servico_id, data, hora_inicio, hora_fim, endereco, numero, complemento, bairro, cidade, estado, cep, status, observacoes, clientes(nome, telefone), servicos(nome)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!agendamento) {
    notFound();
  }

  const [{ data: clientes }, { data: servicos }] = await Promise.all([
    supabase
      .from("clientes")
      .select(
        "id, nome, endereco, numero, complemento, bairro, cidade, estado, cep",
      )
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .order("nome"),
    supabase
      .from("servicos")
      .select("id, nome, duracao_minutos")
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .eq("ativo", true)
      .order("nome"),
  ]);

  const updateAgendamentoComId = updateAgendamento.bind(null, id);

  const cliente = agendamento.clientes as unknown as {
    nome: string;
    telefone: string;
  } | null;
  const servico = agendamento.servicos as unknown as { nome: string } | null;

  const empresa = usuario?.empresas as unknown as {
    nome: string;
    mensagem_confirmacao: string | null;
  } | null;

  const mensagemConfirmacao = montarMensagemConfirmacao({
    template: empresa?.mensagem_confirmacao || MENSAGENS_PADRAO.confirmacao,
    clienteNome: cliente?.nome ?? "Cliente",
    empresaNome: empresa?.nome ?? "",
    data: agendamento.data,
    horaInicio: agendamento.hora_inicio,
    servicoNome: servico?.nome ?? null,
    endereco: agendamento.endereco,
    numero: agendamento.numero,
    complemento: agendamento.complemento,
    bairro: agendamento.bairro,
    cidade: agendamento.cidade,
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/agenda" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar agendamento
        </h1>
      </div>
      <AgendamentoForm
        action={updateAgendamentoComId}
        clientes={clientes ?? []}
        servicos={servicos ?? []}
        defaultValues={agendamento}
        error={errorParam}
        submitLabel="Salvar alterações"
      />

      {cliente?.telefone && (
        <div className="mt-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Confirmar agendamento
          </span>
          <EnviarWhatsappPdf
            telefone={cliente.telefone}
            mensagemPadrao={mensagemConfirmacao}
          />
        </div>
      )}

      <Link
        href={`/financeiro/novo?agendamento_id=${agendamento.id}`}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-white text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      >
        <Banknote className="h-4 w-4" />
        Lançar recebimento
      </Link>

      <form action={deleteAgendamento} className="mt-3">
        <input type="hidden" name="id" value={agendamento.id} />
        <input type="hidden" name="data" value={agendamento.data} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir o agendamento de ${cliente?.nome ?? "cliente"}? Esta ação não pode ser desfeita.`}
          className="h-12 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Excluir agendamento
        </BotaoExcluir>
      </form>
    </div>
  );
}
