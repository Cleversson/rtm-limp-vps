import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { enviarTelegram } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { data: admin } = await supabase.from("usuarios").select("role").eq("id", user.id).maybeSingle();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Sem permissao" }, { status: 403 });
  const { usuarioId, ativo, email } = await request.json();
  const service = createServiceClient();
  const { error } = await service.from("usuarios").update({ ativo }).eq("id", usuarioId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!ativo) {
    await service.auth.admin.signOut(usuarioId, "others").catch(() => {});
  }
  const hora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const msg = ativo ? "[DESBLOQUEADO] Usuario desbloqueado. Email: " + email + ". Hora: " + hora : "[BLOQUEADO] Usuario bloqueado. Email: " + email + ". Hora: " + hora;
  await enviarTelegram(msg).catch(() => {});
  return NextResponse.json({ ok: true });
}