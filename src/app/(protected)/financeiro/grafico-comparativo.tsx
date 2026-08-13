export type PontoComparativo = {
  mesLabel: string;
  entradas: number;
  saidas: number;
};

export function GraficoComparativo({ dados }: { dados: PontoComparativo[] }) {
  const maior = Math.max(
    1,
    ...dados.flatMap((d) => [d.entradas, d.saidas]),
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Entradas x Saídas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparativo dos últimos {dados.length} meses
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Entradas
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Saídas
          </span>
        </div>
      </div>

      <div className="mt-6 flex h-40 justify-between gap-2">
        {dados.map((d) => (
          <div
            key={d.mesLabel}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex w-full flex-1 items-end justify-center gap-1">
              <div
                className="w-full max-w-4 rounded-t bg-emerald-500"
                style={{
                  height: `${Math.max(2, Math.round((d.entradas / maior) * 100))}%`,
                }}
              />
              <div
                className="w-full max-w-4 rounded-t bg-red-500"
                style={{
                  height: `${Math.max(2, Math.round((d.saidas / maior) * 100))}%`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {d.mesLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
