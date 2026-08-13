export default function Loading() {
  return (
    <div>
      <div className="h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
          />
        ))}
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
