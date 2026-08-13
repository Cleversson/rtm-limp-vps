import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { renderPdfBuffer } from "@/lib/pdf/render";
import { ReciboDocument } from "@/lib/pdf/ReciboDocument";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/formasPagamento";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transacaoId: string }> },
) {
  const { transacaoId } = await params;
  const supabase = createServiceClient();
  const erroServidor = () =>
    NextResponse.json(
      { error: "Erro ao gerar o PDF. Tente novamente em instantes." },
      { status: 500 },
    );
  const { data: transacao, error: transacaoError } = await supabase
    .from("transacoes")
    .select("id, tipo, descricao, valor, data, empresa_id, cliente_id, forma_pagamento, clientes(nome, telefone), assinaturas(nome, imagem_url)")
    .eq("id", transacaoId)
    .maybeSingle();
  if (transacaoError) {
    console.error("Erro ao buscar transacao para PDF:", transacaoError);
    return erroServidor();
  }
  if (!transacao || transacao.tipo !== "entrada" || !transacao.cliente_id) {
    return NextResponse.json({ error: "Recibo indisponivel." }, { status: 404 });
  }
  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("nome, whatsapp, telefone, email, endereco, cidade, logo_url, forma_pagamento")
    .eq("id", transacao.empresa_id)
    .maybeSingle();
  if (empresaError || !empresa) {
    console.error("Erro ao buscar empresa:", empresaError);
    return erroServidor();
  }
  const cliente = transacao.clientes as unknown as { nome: string; telefone: string | null } | null;
  const assinatura = transacao.assinaturas as unknown as { nome: string; imagem_url: string } | null;
  try {
    const buffer = await renderPdfBuffer(
      ReciboDocument({
        empresa,
        recibo: {
          valor: Number(transacao.valor),
          descricao: transacao.descricao,
          data: transacao.data,
          cliente: { nome: cliente?.nome ?? "Cliente", telefone: cliente?.telefone ?? null },
          formaPagamentoLabel: transacao.forma_pagamento
            ? (FORMA_PAGAMENTO_LABEL[transacao.forma_pagamento] ?? transacao.forma_pagamento)
            : null,
          assinaturaImagemUrl: assinatura?.imagem_url ?? null,
        },
      }),
    );
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="recibo-${transacaoId}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Erro ao renderizar PDF de recibo:", err);
    return erroServidor();
  }
}
