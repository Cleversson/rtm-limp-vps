"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:${file.type || "image/jpeg"};base64,${base64}`;
}

async function requireSupabase() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

async function requireEmpresaId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();
  if (!usuario?.empresa_id) {
    redirect(`/assinaturas?error=${encodeURIComponent("Nenhuma empresa vinculada.")}`);
  }
  return usuario.empresa_id;
}

export async function createAssinatura(formData: FormData) {
  const { supabase, userId } = await requireSupabase();
  const empresaId = await requireEmpresaId(supabase, userId);

  const nome = String(formData.get("nome") ?? "");
  const imagem = formData.get("imagem");

  if (!(imagem instanceof File) || imagem.size === 0) {
    redirect(`/assinaturas/novo?error=${encodeURIComponent("Selecione uma imagem.")}`);
  }

  let imagemUrl: string;
  try {
    imagemUrl = await fileToBase64(imagem);
  } catch (err) {
    redirect(`/assinaturas/novo?error=${encodeURIComponent(String(err))}`);
  }

  const id = randomUUID();
  const { error } = await supabase.from("assinaturas").insert({
    id,
    empresa_id: empresaId,
    nome,
    imagem_url: imagemUrl,
  });

  if (error) redirect(`/assinaturas/novo?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/assinaturas");
  redirect("/assinaturas");
}

export async function updateAssinatura(id: string, formData: FormData) {
  const { supabase, userId } = await requireSupabase();
  await requireEmpresaId(supabase, userId);

  const nome = String(formData.get("nome") ?? "");
  const imagem = formData.get("imagem");
  const updates: Record<string, string> = { nome };

  if (imagem instanceof File && imagem.size > 0) {
    try {
      updates.imagem_url = await fileToBase64(imagem);
    } catch (err) {
      redirect(`/assinaturas/${id}/editar?error=${encodeURIComponent(String(err))}`);
    }
  }

  const { error } = await supabase.from("assinaturas").update(updates).eq("id", id);
  if (error) redirect(`/assinaturas/${id}/editar?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/assinaturas");
  redirect("/assinaturas");
}

export async function deleteAssinatura(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("assinaturas").delete().eq("id", id);
  if (error) redirect(`/assinaturas?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/assinaturas");
}
