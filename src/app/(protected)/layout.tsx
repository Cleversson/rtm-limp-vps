import { getUsuarioAtual } from "@/lib/supabase/auth";
import { ProtectedShell } from "./protected-shell";

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

  const empresaNome = (
    usuario?.empresas as { nome: string } | null | undefined
  )?.nome;

  const initials = getInitials(empresaNome ?? user.email ?? "RTM");

  return <ProtectedShell initials={initials}>{children}</ProtectedShell>;
}
