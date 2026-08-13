import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import {
  buscarDadosDaEmpresa,
  hojeISO,
  slug,
  type LinhaExportada,
} from "@/lib/exportarDados";
import { CATEGORIA_LABEL } from "@/app/(protected)/financeiro/categorias";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/formasPagamento";
import { calcularTotalOrcamento, type TipoDesconto } from "@/lib/orcamento";

const AGENDAMENTO_STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  pendente: "Pendente",
  concluido: "Concluído",
};

const ORCAMENTO_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  concluido: "Concluído",
};

function porId(linhas: LinhaExportada[]): Map<string, LinhaExportada> {
  return new Map(linhas.map((l) => [l.id as string, l]));
}

export async function GET() {
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return NextResponse.json(
      {
        error:
          "Administradores não têm uma empresa própria para exportar dados nesta fase.",
      },
      { status: 400 },
    );
  }

  const { dados, erro } = await buscarDadosDaEmpresa(
    supabase,
    usuario.empresa_id,
  );

  if (erro || !dados) {
    return NextResponse.json(
      { error: "Erro ao exportar os dados. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  const clientesPorId = porId(dados.clientes);
  const servicosPorId = porId(dados.servicos);
  const orcamentosPorId = porId(dados.orcamentos);

  const nomeCliente = (id: unknown) =>
    (id && (clientesPorId.get(id as string)?.nome as string)) || "";
  const nomeServico = (id: unknown) =>
    (id && (servicosPorId.get(id as string)?.nome as string)) || "";

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RTM Limp";
  workbook.created = new Date();

  const clientesSheet = workbook.addWorksheet("Clientes");
  clientesSheet.columns = [
    { header: "Nome", key: "nome", width: 26 },
    { header: "Telefone", key: "telefone", width: 16 },
    { header: "E-mail", key: "email", width: 24 },
    { header: "Endereço", key: "endereco", width: 24 },
    { header: "Número", key: "numero", width: 10 },
    { header: "Bairro", key: "bairro", width: 18 },
    { header: "Cidade", key: "cidade", width: 18 },
    { header: "UF", key: "estado", width: 6 },
    { header: "CEP", key: "cep", width: 12 },
    { header: "Recorrência (meses)", key: "recorrencia_meses", width: 18 },
    { header: "Observações", key: "observacoes", width: 30 },
  ];
  clientesSheet.addRows(dados.clientes);

  const agendamentosSheet = workbook.addWorksheet("Agendamentos");
  agendamentosSheet.columns = [
    { header: "Data", key: "data", width: 12 },
    { header: "Início", key: "hora_inicio", width: 10 },
    { header: "Fim", key: "hora_fim", width: 10 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Serviço", key: "servico", width: 24 },
    { header: "Status", key: "status", width: 14 },
    { header: "Endereço", key: "endereco", width: 24 },
    { header: "Cidade", key: "cidade", width: 18 },
    { header: "UF", key: "estado", width: 6 },
  ];
  agendamentosSheet.addRows(
    dados.agendamentos.map((a) => ({
      ...a,
      cliente: nomeCliente(a.cliente_id),
      servico: nomeServico(a.servico_id),
      status: AGENDAMENTO_STATUS_LABEL[a.status as string] ?? a.status,
    })),
  );

  const transacoesSheet = workbook.addWorksheet("Transações");
  transacoesSheet.columns = [
    { header: "Data", key: "data", width: 12 },
    { header: "Tipo", key: "tipo", width: 10 },
    { header: "Descrição", key: "descricao", width: 26 },
    { header: "Categoria", key: "categoria", width: 24 },
    { header: "Valor (R$)", key: "valor", width: 14 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Forma de pagamento", key: "forma_pagamento", width: 20 },
  ];
  transacoesSheet.addRows(
    dados.transacoes.map((t) => ({
      ...t,
      tipo: t.tipo === "entrada" ? "Entrada" : "Saída",
      categoria: CATEGORIA_LABEL[t.categoria as string] ?? t.categoria,
      cliente: nomeCliente(t.cliente_id),
      forma_pagamento: t.forma_pagamento
        ? (FORMA_PAGAMENTO_LABEL[t.forma_pagamento as string] ??
          t.forma_pagamento)
        : "",
    })),
  );

  const orcamentosSheet = workbook.addWorksheet("Orçamentos");
  orcamentosSheet.columns = [
    { header: "Número", key: "numero", width: 10 },
    { header: "Data", key: "created_at", width: 14 },
    { header: "Cliente", key: "cliente", width: 24 },
    { header: "Status", key: "status", width: 14 },
    { header: "Desconto", key: "desconto", width: 12 },
    { header: "Tipo de Desconto", key: "desconto_tipo_label", width: 16 },
    { header: "Total (R$)", key: "total", width: 14 },
  ];
  orcamentosSheet.addRows(
    dados.orcamentos.map((o) => {
      const itens = dados.orcamento_itens.filter(
        (i) => i.orcamento_id === o.id,
      );
      const subtotal = itens.reduce(
        (s, i) => s + Number(i.quantidade) * Number(i.valor_unitario),
        0,
      );
      const descontoTipo = (o.desconto_tipo as TipoDesconto) ?? "fixo";
      return {
        ...o,
        created_at: (o.created_at as string)?.slice(0, 10),
        cliente: nomeCliente(o.cliente_id),
        status: ORCAMENTO_STATUS_LABEL[o.status as string] ?? o.status,
        desconto_tipo_label:
          descontoTipo === "percentual" ? "Porcentagem (%)" : "Valor fixo (R$)",
        total: calcularTotalOrcamento(subtotal, Number(o.desconto ?? 0), descontoTipo),
      };
    }),
  );

  const itensSheet = workbook.addWorksheet("Itens de Orçamento");
  itensSheet.columns = [
    { header: "Número do Orçamento", key: "numero_orcamento", width: 20 },
    { header: "Serviço", key: "nome", width: 26 },
    { header: "Quantidade", key: "quantidade", width: 12 },
    { header: "Valor Unitário (R$)", key: "valor_unitario", width: 18 },
    { header: "Subtotal (R$)", key: "subtotal", width: 14 },
  ];
  itensSheet.addRows(
    dados.orcamento_itens.map((i) => ({
      ...i,
      numero_orcamento: orcamentosPorId.get(i.orcamento_id as string)
        ?.numero,
      subtotal: Number(i.quantidade) * Number(i.valor_unitario),
    })),
  );

  const servicosSheet = workbook.addWorksheet("Serviços");
  servicosSheet.columns = [
    { header: "Nome", key: "nome", width: 26 },
    { header: "Categoria", key: "categoria", width: 20 },
    { header: "Preço (R$)", key: "preco", width: 14 },
    { header: "Duração (min)", key: "duracao_minutos", width: 16 },
    { header: "Ativo", key: "ativo", width: 10 },
  ];
  servicosSheet.addRows(
    dados.servicos.map((s) => ({
      ...s,
      ativo: s.ativo ? "Sim" : "Não",
    })),
  );

  const produtosSheet = workbook.addWorksheet("Produtos");
  produtosSheet.columns = [
    { header: "Nome", key: "nome", width: 26 },
    { header: "Preço de Compra (R$)", key: "preco_compra", width: 20 },
    { header: "Volume (ml)", key: "volume_ml", width: 14 },
    { header: "Preço/ml (R$)", key: "preco_ml", width: 14 },
  ];
  produtosSheet.addRows(
    dados.produtos.map((p) => ({
      ...p,
      preco_ml:
        Number(p.volume_ml) > 0
          ? Number(p.preco_compra) / Number(p.volume_ml)
          : "",
    })),
  );

  for (const sheet of workbook.worksheets) {
    sheet.getRow(1).font = { bold: true };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const nomeEmpresa = slug((dados.empresa?.nome as string) ?? "empresa");
  const filename = `rtm-limp-export-${nomeEmpresa}-${hojeISO()}.xlsx`;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
