import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { ShieldOff, CheckCircle } from "lucide-react";

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: usuario } = await supabase.from("usuarios").select("empresa_id").eq("id", user.id).maybeSingle();
  const { data: plano } = await supabase.from("planos_acesso").select("*").eq("empresa_id", usuario?.empresa_id ?? "").maybeSingle();

  const trialExpirado = plano && plano.status === "trial" && new Date(plano.trial_fim) < new Date();
  const bloqueado = plano?.status === "bloqueado";

  const LINK_MENSAL = "https://pay.greenn.com.br/" + process.env.GREENN_PRODUCT_MENSAL;
  const LINK_ANUAL = "https://pay.greenn.com.br/" + process.env.GREENN_PRODUCT_ANUAL;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <ShieldOff className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {trialExpirado ? "Seu periodo gratuito encerrou" : "Acesso bloqueado"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {trialExpirado ? "Seus 7 dias gratuitos terminaram. Assine para continuar usando o RTM Limp." : "Sua assinatura foi cancelada ou expirou. Renove para continuar."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <a href={LINK_MENSAL} target="_blank"
            className="flex flex-col items-center rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-5 text-center transition hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Plano Mensal</span>
            <span className="mt-1 text-3xl font-bold text-slateald-900 dark:text-slate-100">R$ 49,90</span>
            <span className="text-xs text-slate-500">/mes</span>
            <span className="mt-3 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white">Assinar agora</span>
          </a>

          <a href={LINK_ANUAL} target="_blank"
            className="flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-white p-5 text-center transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Plano Anual</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">R$ 297,00</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">-50%</span>
            </div>
            <span className="text-xs text-slate-500">/ano (equivale a R4,75/mes)</span>
            <span className="mt-3 rounded-lg border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-300">Assinar anual</span>
          </a>
        </div>

        <div className="flex w-full flex-col gap-2">
          {["Agenda de atendimentos", "Gestao de clientes", "Orcamentos profissionais", "Controle financeiro", "PDFs de recibo"].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              {f}
            </div>
          ))}
        </div>

        <form action={signOut} className="w-full">
          <button type="submit" className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
            Sair da conta
          </button>
        </form>
      </div>
    </div>
  );
}