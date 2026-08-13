import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";

export type EmpresaBrand = {
  nome: string;
  whatsapp: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  logo_url: string | null;
  forma_pagamento: string | null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#0F172A",
    paddingBottom: 12,
    marginBottom: 20,
  },
  left: { flexDirection: "row", alignItems: "center" },
  logo: { width: 100, height: 56, objectFit: "contain", marginRight: 10 },
  nome: { fontSize: 16, fontWeight: "bold", color: "#0F172A" },
  contatoBlock: { alignItems: "flex-end" },
  contatoLinha: { fontSize: 9, color: "#475569" },
});

export function BrandHeader({ empresa }: { empresa: EmpresaBrand }) {
  const whatsapp = empresa.whatsapp?.trim() || null;
  const telefone = empresa.telefone?.trim() || null;

  const linhasTelefone: string[] =
    whatsapp && telefone && whatsapp === telefone
      ? [`WhatsApp/Tel: ${whatsapp}`]
      : [
          whatsapp ? `WhatsApp: ${whatsapp}` : null,
          telefone ? `Tel: ${telefone}` : null,
        ].filter((linha): linha is string => Boolean(linha));

  const contatos = [
    ...linhasTelefone,
    empresa.email,
    [empresa.endereco, empresa.cidade].filter(Boolean).join(", ") || null,
  ].filter((linha): linha is string => Boolean(linha));

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {empresa.logo_url && (
          // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF node, not an <img>; it has no alt prop.
          <Image src={empresa.logo_url} style={styles.logo} />
        )}
        <Text style={styles.nome}>{empresa.nome}</Text>
      </View>
      <View style={styles.contatoBlock}>
        {contatos.map((linha, i) => (
          <Text key={i} style={styles.contatoLinha}>
            {linha}
          </Text>
        ))}
      </View>
    </View>
  );
}
