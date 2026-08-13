export default function Loading() {
  return (
    <div>
      <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

      <div className="mt-4 h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

      <div className="mt-4 h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
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
