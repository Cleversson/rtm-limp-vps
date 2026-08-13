import { ShieldOff } from "lucide-react";
import { signOut } from "@/app/login/actions";

export default function AcessoSuspensoPag() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-slate-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <ShieldOff className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Acesso suspenso</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Seu acesso foi temporariamente suspenso. Entre em contato com o administrador do sistema para mais informacoes.</p>
        <form action={signOut}>
          <button type="submit" className="mt-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}
