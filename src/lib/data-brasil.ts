export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function hojeBrasilia(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function primeiroEUltimoDia(
  ano: number,
  mes: number,
): { primeiro: string; ultimo: string; diasNoMes: number } {
  const diasNoMes = new Date(ano, mes, 0).getDate();
  return {
    primeiro: `${ano}-${pad2(mes)}-01`,
    ultimo: `${ano}-${pad2(mes)}-${pad2(diasNoMes)}`,
    diasNoMes,
  };
}

export function mesAdjacente(ano: number, mes: number, delta: number) {
  const totalMeses = ano * 12 + (mes - 1) + delta;
  return {
    ano: Math.floor(totalMeses / 12),
    mes: (totalMeses % 12) + 1,
  };
}

export function adicionarMeses(dataStr: string, meses: number): string {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const data = new Date(ano, mes - 1 + meses, dia);
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}

export function adicionarDias(dataStr: string, dias: number): string {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia + dias);
  return `${data.getFullYear()}-${pad2(data.getMonth() + 1)}-${pad2(data.getDate())}`;
}
