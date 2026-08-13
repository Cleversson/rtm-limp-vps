"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function salvarMensagens(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  const empresaId = usuario?.empresa_id;

  if (!empresaId) {
    redirect(
      `/mensagens?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("empresas")
    .update({
      mensagem_orcamento: String(formData.get("mensagem_orcamento") ?? ""),
      mensagem_recibo: String(formData.get("mensagem_recibo") ?? ""),
      mensagem_lembrete: String(formData.get("mensagem_lembrete") ?? ""),
      mensagem_confirmacao: String(formData.get("mensagem_confirmacao") ?? ""),
    })
    .eq("id", empresaId);

  if (error) {
    redirect(`/mensagens?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/mensagens");
  redirect(
    `/mensagens?message=${encodeURIComponent("Mensagens atualizadas com sucesso.")}`,
  );
}
