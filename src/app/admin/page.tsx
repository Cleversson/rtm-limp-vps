import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Building2, Users, CalendarClock, Banknote, FileText, UserRound } from "lucide-react";

async function getDashboardData() {
  const supabase = await createClient();
  const [empresas, usuarios, agendamentos, orcamentos, clientes, transacoes] = await Promise.all([
    supabase.from("empresas").select("id, nome, contato_email, created_at, ativo"),
    supabase.from("usuarios").select("id"),
    supabase.from("agendamentos").select("id"),
    supabase.from("orcamentos").select("id"),
    supabase.from("clientes").select("id"),
    supabase.from("transacoes").select("id"),
  ]);
  return {
    empresas: empresas.data || [],
    usuarios: usuarios.data || [],
    agendamentos: agendamentos.data || [],
    orcamentos: orcamentos.data || [],
    clientes: clientes.data || [],
    transacoes: transacoes.data || [],
  };
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ testes?: string }> }) {
  const params = await searchParams;
  const mostrarTestes = params.testes === "1";
  const data = await getDashboardData();
  const empresasReais = data.empresas.filter(e => !e.contato_email?.includes("@example.com"));
  const empresasTeste = data.empresas.filter(e => e.contato_email?.includes("@example.com"));
  const ativas = empresasReais.filter(e => e.ativo !== false);
  const empresasExibidas = mostrarTestes ? data.empresas : empresasReais;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Visao Geral</h1>
      <Link href={mostrarTestes ? "/admin" : "/admin?testes=1"} className="mt-2 inline-block text-xs font-medium text-emerald-600 hover:underline">
        {mostrarTestes ? "Ocultar empresas de teste" : `Mostrar empresas de teste (${empresasTeste.length})`}
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Empresas
          </span>
          <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{empresasReais.length}</span>
          <Link href="/admin/empresas" className="text-xs font-semibold text-emerald-600 hover:underline">Ver todas &rarr;</Link>
        </div>
        <div className="flex h-32 flex-col justify-between rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-5 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20">
          <span className="text-sm font-medium text-slate-500">Ativas (7d)</span>
          <span className="text-3xl font-bold text-emerald-600">{ativas.length}</span>
          <span className="text-xs font-medium text-slate-400">{empresasReais.length - ativas.length} inativas</span>
        </div>
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Uso do sistema</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          { label: "Usuarios", value: data.usuarios.length, icon: UserRound },
          { label: "Clientes", value: data.clientes.length, icon: Users },
          { label: "Agendamentos", value: data.agendamentos.length, icon: CalendarClock },
          { label: "Transacoes", value: data.transacoes.length, icon: Banknote },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex h-24 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <Icon className="h-3 w-3" aria-hidden="true" />
              {label}
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{value}</span>
          </div>
        ))}
        <div className="col-span-2 flex h-24 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <FileText className="h-3 w-3" aria-hidden="true" />
            Orcamentos
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{data.orcamentos.length}</span>
        </div>
      </div>
    </div>
  );
}