export type CategoriaOption = {
  value: string;
  label: string;
};

export const CATEGORIAS_ENTRADA: CategoriaOption[] = [
  { value: "higienizacao_sofa", label: "Higienização de sofá/estofado" },
  { value: "higienizacao_colchao", label: "Higienização de colchão" },
  { value: "impermeabilizacao", label: "Impermeabilização" },
  { value: "lavagem_tapete_carpete", label: "Lavagem de tapete/carpete" },
  { value: "taxa_deslocamento", label: "Taxa de deslocamento" },
  { value: "outros", label: "Outros" },
];

export const CATEGORIAS_SAIDA: CategoriaOption[] = [
  { value: "produtos", label: "Produtos de limpeza" },
  { value: "combustivel", label: "Combustível" },
  { value: "manutencao_equipamento", label: "Manutenção de equipamento" },
  { value: "compra_equipamento", label: "Compra de equipamento" },
  { value: "marketing", label: "Marketing/Anúncios" },
  { value: "aluguel", label: "Aluguel/Local" },
  { value: "ajudante_terceirizado", label: "Ajudante/Terceirizado" },
  { value: "internet_telefone", label: "Internet/Telefone" },
  { value: "taxas_contabilidade", label: "Taxas/Contabilidade" },
  { value: "outros", label: "Outros" },
];

export const CATEGORIA_LABEL: Record<string, string> = Object.fromEntries(
  [...CATEGORIAS_ENTRADA, ...CATEGORIAS_SAIDA].map((c) => [c.value, c.label]),
);

// Paleta categórica validada pela skill de dataviz (validate_palette.js) —
// os 8 hues documentados, na ordem fixa (blue/orange/aqua/yellow/magenta/
// green/violet/red). Só despesas entram no gráfico de pizza. Há 9
// categorias reais de despesa, uma a mais que o teto seguro de 8 cores
// categóricas simultâneas — "taxas_contabilidade" (a menos frequente pro
// nicho de limpeza de estofados) divide o cinza neutro com "outros" em vez
// de ganhar uma cor própria. Continua sendo uma categoria distinta nos
// dados e na lista de transações; só a cor do gráfico é compartilhada.
// "aluguel" e "ajudante_terceirizado" usam CSS custom properties (definidas
// em globals.css, com override em .dark) porque as cores originais têm
// contraste insuficiente contra fundo escuro (medido: ~2.1-3.6:1, abaixo do
// mínimo de 3:1 pra elemento gráfico) — as outras 8 já passam nos dois temas
// e continuam fixas em hex, sem precisar de variável.
export const CATEGORIA_COR: Record<string, string> = {
  produtos: "#2a78d6",
  combustivel: "#eb6834",
  manutencao_equipamento: "#1baf7a",
  compra_equipamento: "#eda100",
  marketing: "#e87ba4",
  aluguel: "var(--cat-aluguel)",
  ajudante_terceirizado: "var(--cat-ajudante)",
  internet_telefone: "#e34948",
  taxas_contabilidade: "#94a3b8",
  outros: "#94a3b8",
};
