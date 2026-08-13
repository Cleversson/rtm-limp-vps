import { verificarSenhaBeta } from "./actions";

export default async function BetaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            RTM Limp
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Acesso antecipado (beta)
          </p>
        </div>

        <form
          action={verificarSenhaBeta}
          className="flex w-80 flex-col gap-4 rounded-xl bg-white p-6 shadow-sm dark:border dark:border-slate-800 dark:bg-slate-900"
        >
          {params.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {params.error}
            </p>
          )}

          <input type="hidden" name="next" value={params.next ?? "/login"} />

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
            Senha de acesso
            <input
              type="password"
              name="senha"
              required
              autoFocus
              className="h-12 rounded-lg border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
            />
          </label>

          <button
            type="submit"
            className="h-12 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
