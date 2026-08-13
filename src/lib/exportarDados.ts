import type { SupabaseClient } from "@supabase/supabase-js";

export type LinhaExportada = Record<string, unknown>;

export type DadosExportados = {
  exportado_em: string;
  empresa: LinhaExportada | null;
  clientes: LinhaExportada[];
  servicos: LinhaExportada[];
  agendamentos: LinhaExportada[];
  transacoes: LinhaExportada[];
  orcamentos: LinhaExportada[];
  orcamento_itens: LinhaExportada[];
  produtos: LinhaExportada[];
  assinaturas: LinhaExportada[];
};

export async function buscarDadosDaEmpresa(
  supabase: SupabaseClient,
  empresaId: string,
): Promise<{ dados: DadosExportados | null; erro: string | null }> {
  const [
    resEmpresa,
    resClientes,
    resServicos,
    resAgendamentos,
    resTransacoes,
    resOrcamentos,
    resProdutos,
    resAssinaturas,
  ] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", empresaId).maybeSingle(),
    supabase.from("clientes").select("*").eq("empresa_id", empresaId),
    supabase.from("servicos").select("*").eq("empresa_id", empresaId),
    supabase.from("agendamentos").select("*").eq("empresa_id", empresaId),
    supabase.from("transacoes").select("*").eq("empresa_id", empresaId),
    supabase.from("orcamentos").select("*").eq("empresa_id", empresaId),
    supabase.from("produtos").select("*").eq("empresa_id", empresaId),
    supabase.from("assinaturas").select("*").eq("empresa_id", empresaId),
  ]);

  const queriesComNome = [
    ["empresa", resEmpresa],
    ["clientes", resClientes],
    ["servicos", resServicos],
    ["agendamentos", resAgendamentos],
    ["transacoes", resTransacoes],
    ["orcamentos", resOrcamentos],
    ["produtos", resProdutos],
    ["assinaturas", resAssinaturas],
  ] as const;

  const erros = queriesComNome
    .filter(([, res]) => res.error)
    .map(([nome, res]) => `${nome}: ${res.error!.message}`);

  if (erros.length > 0) {
    console.error("Erro ao exportar dados da empresa:", erros);
    return { dados: null, erro: erros.join("; ") };
  }

  const orcamentos = (resOrcamentos.data ?? []) as LinhaExportada[];
  const orcamentoIds = orcamentos.map((o) => o.id as string);

  let orcamentoItens: LinhaExportada[] = [];
  if (orcamentoIds.length > 0) {
    const { data, error } = await supabase
      .from("orcamento_itens")
      .select("*")
      .in("orcamento_id", orcamentoIds);

    if (error) {
      console.error("Erro ao exportar orcamento_itens:", error);
      return { dados: null, erro: error.message };
    }

    orcamentoItens = (data ?? []) as LinhaExportada[];
  }

  return {
    dados: {
      exportado_em: new Date().toISOString(),
      empresa: resEmpresa.data as LinhaExportada | null,
      clientes: (resClientes.data ?? []) as LinhaExportada[],
      servicos: (resServicos.data ?? []) as LinhaExportada[],
      agendamentos: (resAgendamentos.data ?? []) as LinhaExportada[],
      transacoes: (resTransacoes.data ?? []) as LinhaExportada[],
      orcamentos,
      orcamento_itens: orcamentoItens,
      produtos: (resProdutos.data ?? []) as LinhaExportada[],
      assinaturas: (resAssinaturas.data ?? []) as LinhaExportada[],
    },
    erro: null,
  };
}

const REGEX_DIACRITICOS = new RegExp(
  `[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`,
  "g",
);

export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}
