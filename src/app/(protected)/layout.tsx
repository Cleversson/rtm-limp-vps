import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { ProtectedShell } from "./protected-shell";
import { AcessoBloqueadoGuard } from "@/components/acesso-bloqueado-guard";

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
  const { data: usuarioDb } = await service.from("usuarios").select("ativo").eq("id", user.id).maybeSingle();
  if (usuarioDb && usuarioDb.ativo === false) {
    redirect("/login?error=" + encodeURIComponent("Seu acesso foi suspenso. Entre em contato com o administrador."));
  }
  const empresaNome = (
    usuario?.empresas as { nome: string } | null | undefined
  )?.nome;
  const initials = getInitials(empresaNome ?? user.email ?? "RTM");
  return <ProtectedShell initials={initials}><AcessoBloqueadoGuard />{children}</ProtectedShell>;
}
