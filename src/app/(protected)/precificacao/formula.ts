export type PrecificacaoInput = {
  totalFixos: number;
  horas: number;
  totalVariaveis: number;
  duracao: number;
  margem: number;
  taxaMaquininha: number;
  taxaPix: number;
};

export type PrecificacaoResultado = {
  custoHora: number;
  custoOperacional: number;
  lucro: number;
  precoFinal: number;
};

export function calcularPrecificacao(
  input: PrecificacaoInput,
): PrecificacaoResultado {
  const custoHora = input.horas > 0 ? input.totalFixos / input.horas : 0;
  const custoOperacional = input.duracao * custoHora + input.totalVariaveis;
  const divisor =
    1 - (input.margem + input.taxaMaquininha + input.taxaPix) / 100;
  const precoFinal =
    divisor > 0 ? custoOperacional / divisor : custoOperacional * 1.5;
  const lucro = precoFinal * (input.margem / 100);

  return { custoHora, custoOperacional, lucro, precoFinal };
}
