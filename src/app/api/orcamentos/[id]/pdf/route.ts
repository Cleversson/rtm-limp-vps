import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { renderPdfBuffer } from "@/lib/pdf/render";
import { OrcamentoDocument } from "@/lib/pdf/OrcamentoDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceClient();
  const erroServidor = () =>
    NextResponse.json(
      { error: "Erro ao gerar o PDF. Tente novamente em instantes." },
      { status: 500 },
    );
  const { data: orcamento, error: orcamentoError } = await supabase
    .from("orcamentos")
    .select("id, numero, status, desconto, desconto_tipo, observacoes, created_at, empresa_id, clientes(nome, telefone), orcamento_itens(nome, quantidade, valor_unitario), orcamento_fotos(url)")
    .eq("id", id)
    .maybeSingle();
  if (orcamentoError) {
    console.error("Erro ao buscar orcamento para PDF:", orcamentoError);
    return erroServidor();
  }
  if (!orcamento) {
    return NextResponse.json({ error: "Orcamento nao encontrado." }, { status: 404 });
  }
  const { data: empresa, error: empresaError } = await supabase
    .from("empresas")
    .select("nome, whatsapp, telefone, email, endereco, cidade, logo_url, forma_pagamento")
    .eq("id", orcamento.empresa_id)
    .maybeSingle();
  if (empresaError || !empresa) {
    console.error("Erro ao buscar empresa:", empresaError);
    return erroServidor();
  }
  const cliente = orcamento.clientes as unknown as { nome: string; telefone: string | null } | null;
  try {
    const buffer = await renderPdfBuffer(
      OrcamentoDocument({
        empresa,
        orcamento: {
          numero: orcamento.numero,
          status: orcamento.status,
          created_at: orcamento.created_at,
          desconto: Number(orcamento.desconto),
          desconto_tipo: orcamento.desconto_tipo as "fixo" | "percentual",
          observacoes: orcamento.observacoes,
          cliente: {
            nome: cliente?.nome ?? "Cliente removido",
            telefone: cliente?.telefone ?? null,
          },
          itens: orcamento.orcamento_itens.map((i) => ({
            nome: i.nome,
            quantidade: i.quantidade,
            valor_unitario: Number(i.valor_unitario),
          })),
          fotos: orcamento.orcamento_fotos.map((f) => f.url),
        },
      }),
    );
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="orcamento-${id}.pdf"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error("Erro ao renderizar PDF de orcamento:", err);
    return erroServidor();
  }
}
