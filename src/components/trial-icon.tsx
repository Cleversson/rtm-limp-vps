import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { Clock } from "lucide-react";

export async function TrialIcon({ empresaId }: { empresaId: string | null }) {
  if (!empresaId) return null;
  const service = createServiceClient();
  const { data: plano } = await service
    .from("planos_acesso")
    .select("status, trial_fim")
    .eq("empresa_id", empresaId)
    .maybeSingle();

  if (!plano || plano.status !== "trial") return null;

  const agora = new Date();
  const fim = new Date(plano.trial_fim);
  const diasRestantes = Math.ceil((fim.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
  if (diasRestantes <= 0) return null;

  const urgente = diasRestantes <= 2;

  return (
    <Link href="/upgrade"
      className={"flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " + (urgente ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400")}
    >
      <Clock className="h-3.5 w-3.5" />
      {diasRestantes}d gratis
    </Link>
  );
}