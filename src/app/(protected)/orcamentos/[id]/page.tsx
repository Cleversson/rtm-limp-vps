import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Banknote, CircleCheck, Download, Pencil, Trash2 } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { EnviarWhatsappPdf } from "@/components/enviar-whatsapp-pdf";
import { GaleriaFotos } from "@/components/galeria-fotos";
import { BotaoExcluir } from "@/components/botao-excluir";
import { MENSAGENS_PADRAO, substituirVariaveis } from "@/lib/mensagens";
import { deleteOrcamento, updateStatusOrcamento } from "../actions";
import { StatusOrcamentoSelect } from "../status-select";
import {
  STATUS_ORCAMENTO_CLASSES,
  STATUS_ORCAMENTO_LABEL,
  calcularDesconto,
  calcularTotalOrcamento,
} from "@/lib/orcamento";

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function OrcamentoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  const { data: orcamento } = await supabase
    .from("orcamentos")
    .select(
      "id, numero, status, desconto, desconto_tipo, observacoes, motivo_cancelamento, created_at, clientes(nome, telefone), orcamento_itens(id, nome, quantidade, valor_unitario), orcamento_fotos(id, url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!orcamento) {
    notFound();
  }

  let transacaoVinculada: { id: string } | null = null;
  if (orcamento.status === "concluido") {
    const { data } = await supabase
      .from("transacoes")
      .select("id")
      .eq("orcamento_id", orcamento.id)
      .maybeSingle();
    transacaoVinculada = data;
  }

  const headersList = await headers();
  const origin =
    headersList.get("origin") ?? `https://${headersList.get("host")}`;
  const pdfUrl = `${origin}/api/orcamentos/${orcamento.id}/pdf`;

  const cliente = orcamento.clientes as unknown as {
    nome: string;
    telefone: string | null;
  } | null;

  const subtotal = orcamento.orcamento_itens.reduce(
    (s, i) => s + i.quantidade * Number(i.valor_unitario),
    0,
  );
  const descontoTipo = orcamento.desconto_tipo as "fixo" | "percentual";
  const descontoValor = calcularDesconto(subtotal, Number(orcamento.desconto), descontoTipo);
  const total = calcularTotalOrcamento(subtotal, Number(orcamento.desconto), descontoTipo);

  const empresa = usuario?.empresas as unknown as {
    nome: string;
    mensagem_orcamento: string | null;
  } | null;

  const mensagemPadrao = substituirVariaveis(
    empresa?.mensagem_orcamento || MENSAGENS_PADRAO.orcamento,
    {
      cliente: cliente?.nome ?? "Cliente removido",
      empresa: empresa?.nome ?? "",
      data: new Date(orcamento.created_at).toLocaleDateString("pt-BR"),
      valor: formatarMoeda(total),
      link: pdfUrl,
    },
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/orcamentos" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Orçamento #{orcamento.numero}
          </h1>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_ORCAMENTO_CLASSES[orcamento.status] ??
            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {STATUS_ORCAMENTO_LABEL[orcamento.status] ?? orcamento.status}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {new Date(orcamento.created_at).toLocaleDateString("pt-BR")}
      </p>

      {errorParam && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {errorParam}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Cliente
        </p>
        <p className="font-semibold text-slate-900 dark:text-slate-100">
          {cliente?.nome ?? "Cliente removido"}
        </p>

        <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          {orcamento.orcamento_itens.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-300">
                {item.quantidade}x {item.nome}
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatarMoeda(item.quantidade * Number(item.valor_unitario))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatarMoeda(subtotal)}
            </span>
          </div>
          {Number(orcamento.desconto) > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                Desconto
                {descontoTipo === "percentual" &&
                  ` (${Number(orcamento.desconto)}%)`}
              </span>
              <span className="text-slate-700 dark:text-slate-300">
                - {formatarMoeda(descontoValor)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-base font-bold text-slate-900 dark:text-slate-100">
            <span>Total</span>
            <span>{formatarMoeda(total)}</span>
          </div>
        </div>

        {orcamento.observacoes && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {orcamento.observacoes}
          </p>
        )}

        {orcamento.status === "cancelado" && orcamento.motivo_cancelamento && (
          <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-500/10">
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              Motivo do cancelamento
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
              {orcamento.motivo_cancelamento}
            </p>
          </div>
        )}

        {orcamento.orcamento_fotos.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              Fotos
            </p>
            <GaleriaFotos fotos={orcamento.orcamento_fotos} />
          </div>
        )}

        <p className="mt-4 text-xs italic text-slate-400 dark:text-slate-500">
          Válido por 15 dias a partir da emissão.
        </p>
      </div>

      <StatusOrcamentoSelect
        id={orcamento.id}
        status={orcamento.status}
        action={updateStatusOrcamento}
      />

      {orcamento.status === "concluido" &&
        (transacaoVinculada ? (
          <Link
            href={`/financeiro/${transacaoVinculada.id}/editar`}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <CircleCheck className="h-4 w-4" />
            Recebimento já lançado
          </Link>
        ) : (
          <Link
            href={`/financeiro/novo?orcamento_id=${orcamento.id}`}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-500 bg-white text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
          >
            <Banknote className="h-4 w-4" />
            Lançar recebimento
          </Link>
        ))}

      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Download className="h-4 w-4" />
        Baixar PDF
      </a>

      {cliente?.telefone && (
        <div className="mt-3">
          <EnviarWhatsappPdf
            telefone={cliente.telefone}
            mensagemPadrao={mensagemPadrao}
            pdfUrl={pdfUrl}
          />
        </div>
      )}

      <Link
        href={`/orcamentos/${orcamento.id}/editar`}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Pencil className="h-4 w-4" />
        Editar
      </Link>

      <form action={deleteOrcamento} className="mt-3">
        <input type="hidden" name="id" value={orcamento.id} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir o orçamento #${orcamento.numero}? Esta ação não pode ser desfeita.`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Excluir orçamento
        </BotaoExcluir>
      </form>
    </div>
  );
}
