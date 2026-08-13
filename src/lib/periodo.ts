import { MESES, adicionarDias, mesAdjacente, pad2, primeiroEUltimoDia } from "./data-brasil";

export type TipoPeriodo = "semanal" | "quinzenal" | "mensal" | "anual" | "personalizado";

export type Periodo = {
  tipo: TipoPeriodo;
  ref: string; // reproduz este período via ?ref=; "" para personalizado
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
  rotulo: string;
};

export type PeriodoSearchParams = {
  periodo?: string;
  ref?: string;
  de?: string;
  ate?: string;
};

export const TIPO_PERIODO_LABEL: Record<TipoPeriodo, string> = {
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  anual: "Anual",
  personalizado: "Personalizado",
};

const TIPOS_VALIDOS: TipoPeriodo[] = [
  "semanal",
  "quinzenal",
  "mensal",
  "anual",
  "personalizado",
];

function domingoDaSemana(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const diaSemana = new Date(ano, mes - 1, dia).getDay();
  return adicionarDias(dataStr, -diaSemana);
}

function formatarCurta(dataStr: string): string {
  const [, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}`;
}

function formatarLonga(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}/${ano}`;
}

function deslocarQuinzena(ref: string, delta: number): string {
  const [anoStr, mesStr, metadeStr] = ref.split("-");
  let ano = Number(anoStr);
  let mes = Number(mesStr);
  let metade = Number(metadeStr) + delta;

  while (metade > 2) {
    metade -= 2;
    const prox = mesAdjacente(ano, mes, 1);
    ano = prox.ano;
    mes = prox.mes;
  }
  while (metade < 1) {
    metade += 2;
    const ant = mesAdjacente(ano, mes, -1);
    ano = ant.ano;
    mes = ant.mes;
  }

  return `${ano}-${pad2(mes)}-${metade}`;
}

export function resolverPeriodo(params: PeriodoSearchParams, hoje: string): Periodo {
  const tipo = TIPOS_VALIDOS.includes(params.periodo as TipoPeriodo)
    ? (params.periodo as TipoPeriodo)
    : "mensal";

  if (tipo === "mensal") {
    const ref = params.ref ?? hoje.slice(0, 7);
    const [ano, mes] = ref.split("-").map(Number);
    const { primeiro, ultimo } = primeiroEUltimoDia(ano, mes);
    return {
      tipo,
      ref,
      inicio: primeiro,
      fim: ultimo,
      rotulo: `${MESES[mes - 1]} ${ano}`,
    };
  }

  if (tipo === "semanal") {
    const ref = params.ref ?? domingoDaSemana(hoje);
    const fim = adicionarDias(ref, 6);
    return {
      tipo,
      ref,
      inicio: ref,
      fim,
      rotulo: `${formatarCurta(ref)} a ${formatarCurta(fim)}`,
    };
  }

  if (tipo === "quinzenal") {
    const ref =
      params.ref ?? `${hoje.slice(0, 7)}-${Number(hoje.slice(8, 10)) <= 15 ? 1 : 2}`;
    const [anoStr, mesStr, metadeStr] = ref.split("-");
    const ano = Number(anoStr);
    const mes = Number(mesStr);
    const metade = Number(metadeStr);
    const { ultimo } = primeiroEUltimoDia(ano, mes);
    const inicio = metade === 1 ? `${ano}-${pad2(mes)}-01` : `${ano}-${pad2(mes)}-16`;
    const fim = metade === 1 ? `${ano}-${pad2(mes)}-15` : ultimo;
    return {
      tipo,
      ref,
      inicio,
      fim,
      rotulo: `${metade === 1 ? "1ª" : "2ª"} quinzena de ${MESES[mes - 1]} ${ano}`,
    };
  }

  if (tipo === "anual") {
    const ref = params.ref ?? hoje.slice(0, 4);
    return {
      tipo,
      ref,
      inicio: `${ref}-01-01`,
      fim: `${ref}-12-31`,
      rotulo: ref,
    };
  }

  const de = params.de ?? hoje;
  const ate = params.ate ?? hoje;
  const [inicio, fim] = de <= ate ? [de, ate] : [ate, de];
  return {
    tipo: "personalizado",
    ref: "",
    inicio,
    fim,
    rotulo: `${formatarLonga(inicio)} a ${formatarLonga(fim)}`,
  };
}

export function periodoAnteriorRef(periodo: Periodo): string {
  switch (periodo.tipo) {
    case "mensal": {
      const [ano, mes] = periodo.ref.split("-").map(Number);
      const { ano: a, mes: m } = mesAdjacente(ano, mes, -1);
      return `${a}-${pad2(m)}`;
    }
    case "semanal":
      return adicionarDias(periodo.ref, -7);
    case "quinzenal":
      return deslocarQuinzena(periodo.ref, -1);
    case "anual":
      return String(Number(periodo.ref) - 1);
    default:
      return "";
  }
}

export function periodoProximoRef(periodo: Periodo): string {
  switch (periodo.tipo) {
    case "mensal": {
      const [ano, mes] = periodo.ref.split("-").map(Number);
      const { ano: a, mes: m } = mesAdjacente(ano, mes, 1);
      return `${a}-${pad2(m)}`;
    }
    case "semanal":
      return adicionarDias(periodo.ref, 7);
    case "quinzenal":
      return deslocarQuinzena(periodo.ref, 1);
    case "anual":
      return String(Number(periodo.ref) + 1);
    default:
      return "";
  }
}
