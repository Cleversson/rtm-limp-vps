export type FormaPagamentoOption = {
  value: string;
  label: string;
};

// Lista fixa e independente do texto livre "Formas de pagamento aceitas"
// cadastrado em Configurações — aquele campo é prosa pro rodapé do PDF, não
// uma lista estruturada. Usada só em transações de entrada, pra registrar a
// forma de pagamento usada NAQUELE recebimento específico. Vive em src/lib
// (não em financeiro/categorias.ts) porque também é lida pela rota pública
// de PDF do recibo, fora do route group (protected).
export const FORMAS_PAGAMENTO: FormaPagamentoOption[] = [
  { value: "pix", label: "Pix" },
  { value: "cartao_credito", label: "Cartão de crédito" },
  { value: "cartao_debito", label: "Cartão de débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência bancária" },
  { value: "outro", label: "Outro" },
];

export const FORMA_PAGAMENTO_LABEL: Record<string, string> = Object.fromEntries(
  FORMAS_PAGAMENTO.map((f) => [f.value, f.label]),
);
