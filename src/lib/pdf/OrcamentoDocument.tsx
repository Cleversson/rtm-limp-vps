import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { BrandHeader, type EmpresaBrand } from "./BrandHeader";
import { calcularDesconto, calcularTotalOrcamento, type TipoDesconto } from "@/lib/orcamento";

export type OrcamentoItemDoc = {
  nome: string;
  quantidade: number;
  valor_unitario: number;
};

export type OrcamentoDoc = {
  numero: number;
  status: string;
  created_at: string;
  desconto: number;
  desconto_tipo: TipoDesconto;
  observacoes: string | null;
  cliente: { nome: string; telefone: string | null };
  itens: OrcamentoItemDoc[];
  fotos: string[];
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  concluido: "Concluído",
};

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, color: "#0F172A", fontFamily: "Helvetica" },
  tituloLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: { fontSize: 18, fontWeight: "bold" },
  badge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#10B981",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  secao: { marginBottom: 16 },
  rotulo: { fontSize: 9, color: "#64748B", marginBottom: 2 },
  valor: { fontSize: 11, fontWeight: "bold" },
  tabela: { borderTopWidth: 1, borderTopColor: "#E2E8F0", marginTop: 8 },
  linhaHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  linha: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  colNome: { flex: 3 },
  colQtd: { flex: 1, textAlign: "center" },
  colValor: { flex: 1.5, textAlign: "right" },
  colSubtotal: { flex: 1.5, textAlign: "right" },
  headerTexto: { fontSize: 9, fontWeight: "bold", color: "#475569" },
  totais: { marginTop: 12, alignSelf: "flex-end", width: 220 },
  totalLinha: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#0F172A",
  },
  totalFinalTexto: { fontSize: 12, fontWeight: "bold" },
  formaPagamento: { marginTop: 16, fontSize: 9, color: "#64748B" },
  nota: { marginTop: 24, fontSize: 8, color: "#94A3B8", fontStyle: "italic" },
  fotosGrid: { flexDirection: "row", flexWrap: "wrap" },
  fotoItem: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
});

export function OrcamentoDocument({
  empresa,
  orcamento,
}: {
  empresa: EmpresaBrand;
  orcamento: OrcamentoDoc;
}) {
  const subtotal = orcamento.itens.reduce(
    (s, i) => s + i.quantidade * i.valor_unitario,
    0,
  );
  const descontoValor = calcularDesconto(
    subtotal,
    orcamento.desconto,
    orcamento.desconto_tipo,
  );
  const total = calcularTotalOrcamento(
    subtotal,
    orcamento.desconto,
    orcamento.desconto_tipo,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BrandHeader empresa={empresa} />

        <View style={styles.tituloLinha}>
          <View>
            <Text style={styles.titulo}>Orçamento #{orcamento.numero}</Text>
            <Text style={styles.rotulo}>{formatarData(orcamento.created_at)}</Text>
          </View>
          <Text style={styles.badge}>
            {STATUS_LABEL[orcamento.status] ?? orcamento.status}
          </Text>
        </View>

        <View style={styles.secao}>
          <Text style={styles.rotulo}>Cliente</Text>
          <Text style={styles.valor}>{orcamento.cliente.nome}</Text>
          {orcamento.cliente.telefone && (
            <Text style={styles.rotulo}>{orcamento.cliente.telefone}</Text>
          )}
        </View>

        <View style={styles.tabela}>
          <View style={styles.linhaHeader}>
            <Text style={[styles.colNome, styles.headerTexto]}>Descrição</Text>
            <Text style={[styles.colQtd, styles.headerTexto]}>Qtd</Text>
            <Text style={[styles.colValor, styles.headerTexto]}>Valor unit.</Text>
            <Text style={[styles.colSubtotal, styles.headerTexto]}>Subtotal</Text>
          </View>
          {orcamento.itens.map((item, i) => (
            <View key={i} style={styles.linha}>
              <Text style={styles.colNome}>{item.nome}</Text>
              <Text style={styles.colQtd}>{item.quantidade}</Text>
              <Text style={styles.colValor}>{formatarMoeda(item.valor_unitario)}</Text>
              <Text style={styles.colSubtotal}>
                {formatarMoeda(item.quantidade * item.valor_unitario)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totais}>
          <View style={styles.totalLinha}>
            <Text>Subtotal</Text>
            <Text>{formatarMoeda(subtotal)}</Text>
          </View>
          {orcamento.desconto > 0 && (
            <View style={styles.totalLinha}>
              <Text>
                Desconto
                {orcamento.desconto_tipo === "percentual" &&
                  ` (${orcamento.desconto}%)`}
              </Text>
              <Text>- {formatarMoeda(descontoValor)}</Text>
            </View>
          )}
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalTexto}>Total</Text>
            <Text style={styles.totalFinalTexto}>{formatarMoeda(total)}</Text>
          </View>
        </View>

        {orcamento.observacoes && (
          <View style={styles.secao}>
            <Text style={styles.rotulo}>Observações</Text>
            <Text>{orcamento.observacoes}</Text>
          </View>
        )}

        {orcamento.fotos.length > 0 && (
          <View style={styles.secao}>
            <Text style={styles.rotulo}>Fotos do item</Text>
            <View style={styles.fotosGrid}>
              {orcamento.fotos.map((url, i) => (
                // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF node, not an <img>; it has no alt prop.
                <Image key={i} src={url} style={styles.fotoItem} />
              ))}
            </View>
          </View>
        )}

        {empresa.forma_pagamento && (
          <Text style={styles.formaPagamento}>
            Formas de pagamento: {empresa.forma_pagamento}
          </Text>
        )}

        <Text style={styles.nota}>
          Este orçamento é válido por 15 dias a partir da data de emissão.
        </Text>
      </Page>
    </Document>
  );
}
