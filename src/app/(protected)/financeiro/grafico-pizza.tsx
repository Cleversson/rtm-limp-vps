import { CATEGORIA_COR, CATEGORIA_LABEL } from "./categorias";

export type FatiaPizza = {
  categoria: string;
  valor: number;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function GraficoPizza({ fatias }: { fatias: FatiaPizza[] }) {
  const comValor = fatias.filter((f) => f.valor > 0);
  const total = comValor.reduce((s, f) => s + f.valor, 0);

  const stops = comValor.reduce<{ acumulado: number; segmentos: string[] }>(
    (acc, f) => {
      const inicio = (acc.acumulado / total) * 360;
      const acumulado = acc.acumulado + f.valor;
      const fim = (acumulado / total) * 360;
      const cor = CATEGORIA_COR[f.categoria] ?? CATEGORIA_COR.outros;
      return {
        acumulado,
        segmentos: [...acc.segmentos, `${cor} ${inicio}deg ${fim}deg`],
      };
    },
    { acumulado: 0, segmentos: [] },
  ).segmentos;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Despesas por categoria
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Mês selecionado
      </p>

      {total === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-4">
          <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma despesa neste mês.
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
                {formatarMoeda(total)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {comValor
              .slice()
              .sort((a, b) => b.valor - a.valor)
              .map((f) => (
                <div
                  key={f.categoria}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          CATEGORIA_COR[f.categoria] ?? CATEGORIA_COR.outros,
                      }}
                    />
                    {CATEGORIA_LABEL[f.categoria] ?? f.categoria}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatarMoeda(f.valor)} ·{" "}
                    {Math.round((f.valor / total) * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
