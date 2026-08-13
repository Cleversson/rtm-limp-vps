import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Download } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { EnviarWhatsappPdf } from "@/components/enviar-whatsapp-pdf";
import { MENSAGENS_PADRAO, substituirVariaveis } from "@/lib/mensagens";
import { deleteTransacao, updateTransacao } from "../../actions";
import { TransacaoForm } from "../../transacao-form";
import { BotaoExcluir } from "@/components/botao-excluir";

export default async function EditarTransacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;

  const { usuario, supabase } = await getUsuarioAtual();

  const [{ data: transacao }, { data: clientes }, { data: assinaturas }] =
    await Promise.all([
      supabase
        .from("transacoes")
        .select(
          "id, tipo, descricao, categoria, valor, data, cliente_id, agendamento_id, orcamento_id, forma_pagamento, assinatura_id, clientes(nome, telefone)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("clientes")
        .select("id, nome")
        .eq("empresa_id", usuario?.empresa_id ?? "")
        .order("nome"),
      supabase
        .from("assinaturas")
        .select("id, nome")
        .eq("empresa_id", usuario?.empresa_id ?? "")
        .order("nome"),
    ]);

  if (!transacao) {
    notFound();
  }

  const updateTransacaoComId = updateTransacao.bind(null, id);

  const cliente = transacao.clientes as unknown as {
    nome: string;
    telefone: string | null;
  } | null;
  const podeEmitirRecibo = transacao.tipo === "entrada" && transacao.cliente_id;

  let pdfUrl = "";
  let mensagemPadrao = "";
  if (podeEmitirRecibo) {
    const headersList = await headers();
    const origin =
      headersList.get("origin") ?? `https://${headersList.get("host")}`;
    pdfUrl = `${origin}/api/recibos/${transacao.id}/pdf`;

    const empresa = usuario?.empresas as unknown as {
      nome: string;
      mensagem_recibo: string | null;
    } | null;

    mensagemPadrao = substituirVariaveis(
      empresa?.mensagem_recibo || MENSAGENS_PADRAO.recibo,
      {
        cliente: cliente?.nome ?? "Cliente",
        empresa: empresa?.nome ?? "",
        data: new Date(`${transacao.data}T00:00:00`).toLocaleDateString("pt-BR"),
        valor: Number(transacao.valor).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        link: pdfUrl,
      },
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/financeiro" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar transação
        </h1>
      </div>
      <TransacaoForm
        action={updateTransacaoComId}
        clientes={clientes ?? []}
        assinaturas={assinaturas ?? []}
        defaultValues={transacao}
        error={errorParam}
        submitLabel="Salvar alterações"
      />

      {transacao.tipo === "entrada" && (
        <div className="mt-4">
          {podeEmitirRecibo ? (
            <div className="flex flex-col gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="h-4 w-4" />
                Baixar recibo
              </a>
              {cliente?.telefone && (
                <EnviarWhatsappPdf
                  telefone={cliente.telefone}
                  mensagemPadrao={mensagemPadrao}
                  pdfUrl={pdfUrl}
                />
              )}
            </div>
          ) : (
            <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              Vincule um cliente a esta transação para poder emitir um recibo.
            </p>
          )}
        </div>
      )}

      <form action={deleteTransacao} className="mt-4">
        <input type="hidden" name="id" value={transacao.id} />
        <input type="hidden" name="data" value={transacao.data} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir a transação "${transacao.descricao}"? Esta ação não pode ser desfeita.`}
          className="h-12 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Excluir transação
        </BotaoExcluir>
      </form>
    </div>
  );
}
