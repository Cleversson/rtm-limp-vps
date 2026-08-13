export type FatiaContagem = {
  label: string;
  valor: number;
  cor: string;
};

export function GraficoBairros({ fatias }: { fatias: FatiaContagem[] }) {
  const total = fatias.reduce((s, f) => s + f.valor, 0);

  const stops = fatias.reduce<{ acumulado: number; segmentos: string[] }>(
    (acc, f) => {
      const inicio = (acc.acumulado / total) * 360;
      const acumulado = acc.acumulado + f.valor;
      const fim = (acumulado / total) * 360;
      return {
        acumulado,
        segmentos: [...acc.segmentos, `${f.cor} ${inicio}deg ${fim}deg`],
      };
    },
    { acumulado: 0, segmentos: [] },
  ).segmentos;

  return (
    <>
      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-4">
          <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum atendimento confirmado ou concluído neste período.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mx-auto mt-6 h-36 w-36">
            <div
              className="h-36 w-36 rounded-full"
              style={{ background: `conic-gradient(${stops.join(", ")})` }}
            />
            <div className="absolute inset-0 m-auto flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner dark:bg-slate-900">
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Total
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {total} {total === 1 ? "atendimento" : "atendimentos"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {fatias.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: f.cor }}
                  />
                  {f.label}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {f.valor} · {Math.round((f.valor / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
