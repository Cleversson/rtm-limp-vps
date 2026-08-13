import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import AvisoActions from "@/components/admin-aviso-actions";

export default async function AvisosPage() {
  const supabase = await createClient();
  const { data: avisos } = await supabase
    .from("avisos")
    .select("id, titulo, mensagem, ativo, empresa_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Avisos</h1>
      <p className="mt-1 text-sm text-emerald-600">Mensagens enviadas pro app dos clientes.</p>
      <div className="mt-4 flex flex-col gap-3">
        {(avisos || []).length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900 text-center text-sm text-slate-400">
            Nenhum aviso criado ainda.
          </div>
        )}
        {(avisos || []).map(aviso => (
          <div key={aviso.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{aviso.titulo}</span>
                  <span className={"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + (aviso.ativo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {aviso.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <span className="text-sm text-emerald-600">{aviso.empresa_id ? "Empresa especifica" : "Todas as empresas"}</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{aviso.mensagem}</span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Criado em {new Date(aviso.created_at).toLocaleDateString("pt-BR")}</span>
                  {!aviso.ativo && <AvisoActions avisoId={aviso.id} ativo={aviso.ativo} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/admin/avisos/novo" className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95">
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}