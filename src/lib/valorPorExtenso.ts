const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];
const DEZ_A_DEZENOVE = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function grupoPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const centena = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];

  if (centena > 0) partes.push(CENTENAS[centena]);

  if (resto > 0) {
    if (resto < 10) {
      partes.push(UNIDADES[resto]);
    } else if (resto < 20) {
      partes.push(DEZ_A_DEZENOVE[resto - 10]);
    } else {
      const dezena = Math.floor(resto / 10);
      const unidade = resto % 10;
      partes.push(
        unidade > 0 ? `${DEZENAS[dezena]} e ${UNIDADES[unidade]}` : DEZENAS[dezena],
      );
    }
  }

  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";

  const milhoes = Math.floor(n / 1_000_000);
  const resto1 = n % 1_000_000;
  const milhares = Math.floor(resto1 / 1000);
  const unidades = resto1 % 1000;

  const grupos: { texto: string; valor: number }[] = [];

  if (milhoes > 0) {
    grupos.push({
      texto: milhoes === 1 ? "um milhão" : `${grupoPorExtenso(milhoes)} milhões`,
      valor: milhoes * 1_000_000,
    });
  }
  if (milhares > 0) {
    grupos.push({
      texto: milhares === 1 ? "mil" : `${grupoPorExtenso(milhares)} mil`,
      valor: milhares * 1000,
    });
  }
  if (unidades > 0) {
    grupos.push({ texto: grupoPorExtenso(unidades), valor: unidades });
  }

  if (grupos.length === 1) return grupos[0].texto;

  const ultimo = grupos[grupos.length - 1];
  const anteriores = grupos.slice(0, -1).map((g) => g.texto);
  const usaE = ultimo.valor < 100 || ultimo.valor % 100 === 0;

  return usaE
    ? `${anteriores.join(", ")} e ${ultimo.texto}`
    : `${anteriores.join(", ")}, ${ultimo.texto}`;
}

// "milhão"/"milhões" é substantivo e exige "de" antes de outro substantivo
// (ex: "um milhão de reais"), diferente de "mil" (ex: "cem mil reais", sem "de").
// Só se aplica quando o valor é um múltiplo exato de 1 milhão.
function precisaDeAntesDaMoeda(valor: number): boolean {
  return valor >= 1_000_000 && valor % 1_000_000 === 0;
}

export function valorPorExtenso(valor: number): string {
  const centavosTotal = Math.round(valor * 100);
  const reais = Math.floor(centavosTotal / 100);
  const centavos = centavosTotal % 100;

  const partes: string[] = [];
  if (reais > 0) {
    const de = precisaDeAntesDaMoeda(reais) ? "de " : "";
    partes.push(`${inteiroPorExtenso(reais)} ${de}${reais === 1 ? "real" : "reais"}`);
  }
  if (centavos > 0) {
    partes.push(
      `${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`,
    );
  }

  return partes.length > 0 ? partes.join(" e ") : "zero reais";
}
