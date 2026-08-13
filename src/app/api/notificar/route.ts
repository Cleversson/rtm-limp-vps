import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notificarNovoAviso, notificarEmpresaSuspensa, notificarEmpresaReativada } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const { tipo, dados } = await request.json();

  if (tipo === "novo_aviso") {
    await notificarNovoAviso(dados.titulo, user.email ?? "admin");
  } else if (tipo === "empresa_suspensa") {
    await notificarEmpresaSuspensa(dados.nome, dados.email);
  } else if (tipo === "empresa_reativada") {
    await notificarEmpresaReativada(dados.nome, dados.email);
  }

  return NextResponse.json({ ok: true });
}
