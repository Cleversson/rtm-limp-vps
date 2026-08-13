import { Document, Image, Page, StyleSheet, Text } from "@react-pdf/renderer";
import { BrandHeader, type EmpresaBrand } from "./BrandHeader";
import { valorPorExtenso } from "@/lib/valorPorExtenso";

export type ReciboDoc = {
  valor: number;
  descricao: string;
  data: string;
  cliente: { nome: string; telefone: string | null };
  formaPagamentoLabel?: string | null;
  assinaturaImagemUrl?: string | null;
};

function formatarMoeda(valor: number): string {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, color: "#0F172A", fontFamily: "Helvetica" },
  titulo: { fontSize: 18, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  valorDestaque: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#10B981",
    marginTop: 20,
  },
  valorExtenso: {
    fontSize: 10,
    fontStyle: "italic",
    textAlign: "center",
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  texto: { lineHeight: 1.6, textAlign: "center", marginHorizontal: 20 },
  pagoVia: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0F172A",
  },
  formaPagamento: {
    marginTop: 16,
    fontSize: 9,
    textAlign: "center",
    color: "#64748B",
  },
  assinaturaImagem: {
    marginTop: 50,
    width: 160,
    height: 50,
    objectFit: "contain",
    alignSelf: "center",
  },
  assinaturaLinha: {
    marginTop: 60,
    borderTopWidth: 1,
    borderTopColor: "#0F172A",
    width: 240,
    alignSelf: "center",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 9,
    color: "#64748B",
  },
  assinaturaLinhaComImagem: {
    marginTop: 4,
  },
});

export function ReciboDocument({
  empresa,
  recibo,
}: {
  empresa: EmpresaBrand;
  recibo: ReciboDoc;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BrandHeader empresa={empresa} />
        <Text style={styles.titulo}>Recibo</Text>
        <Text style={styles.valorDestaque}>{formatarMoeda(recibo.valor)}</Text>
        <Text style={styles.valorExtenso}>
          ({valorPorExtenso(recibo.valor)})
        </Text>
        <Text style={styles.texto}>
          Recebemos de {recibo.cliente.nome} o valor de{" "}
          {formatarMoeda(recibo.valor)}, referente a {recibo.descricao}, em{" "}
          {formatarData(recibo.data)}.
        </Text>
        {recibo.formaPagamentoLabel && (
          <Text style={styles.pagoVia}>
            Pago via: {recibo.formaPagamentoLabel}
          </Text>
        )}
        {empresa.forma_pagamento && (
          <Text style={styles.formaPagamento}>
            Formas de pagamento aceitas: {empresa.forma_pagamento}
          </Text>
        )}
        {recibo.assinaturaImagemUrl && (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF node, not an <img>; it has no alt prop.
          <Image
            src={recibo.assinaturaImagemUrl}
            style={styles.assinaturaImagem}
          />
        )}
        <Text
          style={
            recibo.assinaturaImagemUrl
              ? [styles.assinaturaLinha, styles.assinaturaLinhaComImagem]
              : styles.assinaturaLinha
          }
        >
          {empresa.nome}
        </Text>
      </Page>
    </Document>
  );
}
