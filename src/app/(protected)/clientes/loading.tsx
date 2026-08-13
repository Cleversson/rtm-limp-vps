export default function Loading() {
  return (
    <div>
      <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-4 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

      <div className="mt-4 h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
