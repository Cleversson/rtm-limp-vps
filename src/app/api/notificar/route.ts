import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notificarNovoAviso, notificarEmpresaSuspensa, notificarEmpresaReativada, enviarTelegram } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const { tipo, dados } = await request.json();
  const hora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  if (tipo === "novo_aviso") {
    await notificarNovoAviso(dados.titulo, user.email ?? "admin");
  } else if (tipo === "empresa_suspensa") {
    await notificarEmpresaSuspensa(dados.nome, dados.email);
  } else if (tipo === "empresa_reativada") {
    await notificarEmpresaReativada(dados.nome, dados.email);
  } else if (tipo === "usuario_bloqueado") {
    await enviarTelegram("[BLOQUEADO] Usuario bloqueado. Email: " + dados.email + ". Hora: " + hora);
  } else if (tipo === "usuario_desbloqueado") {
    await enviarTelegram("[DESBLOQUEADO] Usuario desbloqueado. Email: " + dados.email + ". Hora: " + hora);
  }
  return NextResponse.json({ ok: true });
}