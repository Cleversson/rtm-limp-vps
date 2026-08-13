import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import AdminShell from "@/components/admin-shell";
import { notificarLoginAdmin } from "@/lib/telegram";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, user } = await getUsuarioAtual();
  if (!usuario || usuario.role !== "admin") {
    redirect("/app");
  }
  notificarLoginAdmin(user.email ?? "admin").catch(() => {});
  return <AdminShell>{children}</AdminShell>;
}
