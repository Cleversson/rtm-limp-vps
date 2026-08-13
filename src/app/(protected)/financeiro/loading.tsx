export default function Loading() {
  return (
    <div>
      <div className="h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

      <div className="mt-4 h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />

      <div className="mt-4 h-14 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
          />
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-6 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
