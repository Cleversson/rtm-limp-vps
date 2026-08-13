import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { ThemeToggleItem } from "@/components/theme-toggle-item";

export default async function AdminContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Minha Conta</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Informacoes do administrador</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">E-mail</span>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{user.email}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Perfil</span>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Administrador</p>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ThemeToggleItem />
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <LogoutButton />
      </div>
    </div>
  );
}