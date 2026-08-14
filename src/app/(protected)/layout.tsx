import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { ProtectedShell } from "./protected-shell";
import { AcessoBloqueadoGuard } from "@/components/acesso-bloqueado-guard";
import { TrialBanner } from "@/components/trial-banner";
import { TrialIcon } from "@/components/trial-icon";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, usuario } = await getUsuarioAtual();
  const service = createServiceClient();
  const { data: usuarioDb } = await service.from("usuarios").select("ativo, empresa_id").eq("id", user.id).maybeSingle();
  if (usuarioDb && usuarioDb.ativo === false) {
    redirect("/login?error=" + encodeURIComponent("Seu acesso foi suspenso. Entre em contato com o administrador."));
  }
  if (usuarioDb?.empresa_id) {
    const { data: plano } = await service.from("planos_acesso").select("status, trial_fim").eq("empresa_id", usuarioDb.empresa_id).maybeSingle();
    if (plano) {
      const trialExpirado = plano.status === "trial" && new Date(plano.trial_fim) < new Date();
      if (trialExpirado || plano.status === "bloqueado") {
        if (trialExpirado) await service.from("planos_acesso").update({ status: "bloqueado", updated_at: new Date().toISOString() }).eq("empresa_id", usuarioDb.empresa_id);
        redirect("/upgrade");
      }
    }
  }
  const empresaNome = (
    usuario?.empresas as { nome: string } | null | undefined
  )?.nome;
  const initials = getInitials(empresaNome ?? user.email ?? "RTM");
  return <ProtectedShell initials={initials} trialBanner={<TrialBanner empresaId={usuarioDb?.empresa_id ?? null} />} trialIcon={<TrialIcon empresaId={usuarioDb?.empresa_id ?? null} />}><AcessoBloqueadoGuard />{children}</ProtectedShell>;
}
