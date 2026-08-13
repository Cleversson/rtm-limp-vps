"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

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

export async function updateEmpresa(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  const empresaId = usuario?.empresa_id;
  if (!empresaId) {
    redirect(`/configuracoes?error=${encodeURIComponent("Nenhuma empresa vinculada.")}`);
  }

  const updates: Record<string, string | null> = {
    nome: String(formData.get("nome") ?? ""),
    whatsapp: nullableString(formData.get("whatsapp")),
    telefone: nullableString(formData.get("telefone")),
    cnpj: nullableString(formData.get("cnpj")),
    endereco: nullableString(formData.get("endereco")),
    cidade: nullableString(formData.get("cidade")),
    instagram: nullableString(formData.get("instagram")),
    site: nullableString(formData.get("site")),
    email: nullableString(formData.get("email")),
    forma_pagamento: nullableString(formData.get("forma_pagamento")),
  };

  const logo = formData.get("logo");
  if (logo instanceof File && logo.size > 0) {
    try {
      updates.logo_url = await fileToBase64(logo);
    } catch (err) {
      redirect(`/configuracoes?error=${encodeURIComponent(String(err))}`);
    }
  }

  const { error } = await supabase.from("empresas").update(updates).eq("id", empresaId);
  if (error) redirect(`/configuracoes?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/configuracoes");
  redirect(`/configuracoes?message=${encodeURIComponent("Dados atualizados com sucesso.")}`);
}

export async function removerLogo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .maybeSingle();

  const empresaId = usuario?.empresa_id;
  if (!empresaId) {
    redirect(`/configuracoes?error=${encodeURIComponent("Nenhuma empresa vinculada.")}`);
  }

  const { error } = await supabase.from("empresas").update({ logo_url: null }).eq("id", empresaId);
  if (error) redirect(`/configuracoes?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/configuracoes");
  redirect(`/configuracoes?message=${encodeURIComponent("Logo removida.")}`);
}
