export type ItemRanking = {
  label: string;
  valor: number;
};

export function RankingServicos({ itens }: { itens: ItemRanking[] }) {
  const maior = Math.max(1, ...itens.map((i) => i.valor));

  return itens.length === 0 ? (
    <div className="mt-6 flex flex-col items-center gap-2 py-4">
      <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800" />
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhum atendimento confirmado ou concluído neste período.
      </p>
    </div>
  ) : (
    <div className="mt-5 flex flex-col gap-3">
      {itens.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-xs font-semibold text-slate-400 dark:text-slate-500">
            {i + 1}º
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                {item.label}
              </span>
              <span className="shrink-0 text-slate-500 dark:text-slate-400">
                {item.valor}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${Math.max(4, Math.round((item.valor / maior) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
