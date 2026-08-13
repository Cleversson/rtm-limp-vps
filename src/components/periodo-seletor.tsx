import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import {
  TIPO_PERIODO_LABEL,
  periodoAnteriorRef,
  periodoProximoRef,
  type Periodo,
  type TipoPeriodo,
} from "@/lib/periodo";

const TIPOS: TipoPeriodo[] = ["semanal", "quinzenal", "mensal", "anual", "personalizado"];

export function PeriodoSeletor({
  periodo,
  basePath,
}: {
  periodo: Periodo;
  basePath: string;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <details
        key={`${periodo.tipo}:${periodo.inicio}:${periodo.fim}`}
        className="group relative"
      >
        <summary className="flex list-none items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm [&::-webkit-details-marker]:hidden dark:border-slate-800 dark:bg-slate-900">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            Filtros: {TIPO_PERIODO_LABEL[periodo.tipo]}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180 dark:text-slate-500" />
        </summary>

        <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
          {TIPOS.map((tipo) => (
            <Link
              key={tipo}
              href={`${basePath}?periodo=${tipo}`}
              className={`block px-4 py-2.5 text-sm font-medium ${
                periodo.tipo === tipo
                  ? "bg-slate-900 text-white dark:bg-slate-700"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {TIPO_PERIODO_LABEL[tipo]}
            </Link>
          ))}
        </div>
      </details>

      {periodo.tipo === "personalizado" ? (
        <form className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <input type="hidden" name="periodo" value="personalizado" />
          <input
            type="date"
            name="de"
            defaultValue={periodo.inicio}
            className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
          />
          <span className="shrink-0 text-sm text-slate-400 dark:text-slate-500">
            até
          </span>
          <input
            type="date"
            name="ate"
            defaultValue={periodo.fim}
            className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-slate-700"
          >
            Aplicar
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Link
            href={`${basePath}?periodo=${periodo.tipo}&ref=${periodoAnteriorRef(periodo)}`}
            className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Período anterior"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {periodo.rotulo}
          </h2>
          <Link
            href={`${basePath}?periodo=${periodo.tipo}&ref=${periodoProximoRef(periodo)}`}
            className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Próximo período"
          >
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
