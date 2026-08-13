import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Building2, Users, CalendarClock, Clock } from "lucide-react";

export default async function EmpresasPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome, contato_email, created_at, ativo")
    .order("created_at", { ascending: false });
  const { data: clientes } = await supabase.from("clientes").select("id, empresa_id");
  const { data: agendamentos } = await supabase.from("agendamentos").select("id, empresa_id, updated_at").order("updated_at", { ascending: false });
  const reais = (empresas || []).filter(e => !e.contato_email?.includes("@example.com"));
  const teste = (empresas || []).filter(e => e.contato_email?.includes("@example.com"));

  function ultimoAcesso(empresaId: string) {
    const ag = (agendamentos || []).find(a => a.empresa_id === empresaId);
    if (!ag) return null;
    return new Date(ag.updated_at).toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Empresas</h1>
      <p className="mt-1 text-sm text-slate-500">{reais.length} empresas</p>

      <div className="mt-4 flex flex-col gap-3">
        {reais.map(empresa => {
          const nClientes = (clientes || []).filter(c => c.empresa_id === empresa.id).length;
          const nAgendamentos = (agendamentos || []).filter(a => a.empresa_id === empresa.id).length;
          const acesso = ultimoAcesso(empresa.id);
          return (
            <Link key={empresa.id} href={`/admin/empresas/${empresa.id}`}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-semibold text-slate-900">{empresa.nome || "Sem nome"}</span>
                <span className="text-sm text-slate-500">{empresa.contato_email}</span>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{nClientes} clientes</span>
                  <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{nAgendamentos} agendamentos</span>
                  {acesso && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Ultimo acesso: {acesso}</span>}
                </div>
                <span className="text-xs text-emerald-600">Criada em {new Date(empresa.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </Link>
          );
        })}
      </div>
      {teste.length > 0 && (
        <p className="mt-4 text-center text-xs text-slate-400">{teste.length} empresas de teste ocultas</p>
      )}
    </div>
  );
}