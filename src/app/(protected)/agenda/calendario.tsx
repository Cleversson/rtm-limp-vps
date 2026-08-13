import Link from "next/link";
import { pad2, primeiroEUltimoDia } from "@/lib/data-brasil";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Calendario({
  ano,
  mes,
  diaSelecionado,
  diasComEvento,
  hoje,
}: {
  ano: number;
  mes: number;
  diaSelecionado: string;
  diasComEvento: Set<string>;
  hoje: string;
}) {
  const { diasNoMes } = primeiroEUltimoDia(ano, mes);
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const mesParam = `${ano}-${pad2(mes)}`;

  const celulas: { dia: number; dataStr: string }[] = [];
  for (let dia = 1; dia <= diasNoMes; dia++) {
    celulas.push({ dia, dataStr: `${ano}-${pad2(mes)}-${pad2(dia)}` });
  }
  const preenchimentoInicial = Array.from({ length: primeiroDiaSemana });
  const totalCelulas =
    Math.ceil((primeiroDiaSemana + diasNoMes) / 7) * 7;
  const preenchimentoFinal = Array.from({
    length: totalCelulas - primeiroDiaSemana - diasNoMes,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid grid-cols-7 gap-1 p-4 text-center">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="py-1 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            {d}
          </div>
        ))}

        {preenchimentoInicial.map((_, i) => (
          <div key={`vazio-inicio-${i}`} />
        ))}

        {celulas.map(({ dia, dataStr }) => {
          const temEvento = diasComEvento.has(dataStr);
          const selecionado = dataStr === diaSelecionado;
          const ehHoje = dataStr === hoje;

          return (
            <Link
              key={dataStr}
              href={`/agenda?periodo=mensal&ref=${mesParam}&dia=${dataStr}`}
              className="flex items-center justify-center py-1"
            >
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  selecionado
                    ? "bg-emerald-500 font-bold text-white shadow-md"
                    : ehHoje
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {dia}
                {temEvento && !selecionado && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-500" />
                )}
              </span>
            </Link>
          );
        })}

        {preenchimentoFinal.map((_, i) => (
          <div key={`vazio-fim-${i}`} />
        ))}
      </div>
    </div>
  );
}
