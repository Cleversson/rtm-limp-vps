import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { Clock } from "lucide-react";

export async function TrialBanner({ empresaId }: { empresaId: string | null }) {
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
  if (diasRestantes <= 0 || diasRestantes > 2) return null;

  const texto = diasRestantes === 1 ? "Ultimo dia do periodo gratuito!" : "2 dias restantes no periodo gratuito";

  return (
    <div className="flex items-center justify-between gap-3 bg-red-500 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-white">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="font-medium">{texto}</span>
      </div>
      <Link href="/upgrade" className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50">
        Assinar agora
      </Link>
    </div>
  );
}