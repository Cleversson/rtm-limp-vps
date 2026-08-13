export default function Loading() {
  return (
    <div>
      <div className="h-8 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

      <div className="mt-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 shrink-0 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800"
          />
        ))}
      </div>
    </div>
  );
}
