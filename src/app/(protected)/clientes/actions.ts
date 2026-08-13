"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

function clienteFields(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: nullableString(formData.get("email")),
    endereco: nullableString(formData.get("endereco")),
    numero: nullableString(formData.get("numero")),
    complemento: nullableString(formData.get("complemento")),
    bairro: nullableString(formData.get("bairro")),
    cidade: nullableString(formData.get("cidade")),
    estado: nullableString(formData.get("estado")),
    cep: nullableString(formData.get("cep")),
    observacoes: nullableString(formData.get("observacoes")),
    recorrencia_meses: Number(formData.get("recorrencia_meses") ?? 6),
  };
}

async function requireSupabase() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, userId: user.id };
}

export async function createCliente(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/clientes?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const { error } = await supabase.from("clientes").insert({
    empresa_id: usuario.empresa_id,
    ...clienteFields(formData),
  });

  if (error) {
    redirect(`/clientes/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const { error } = await supabase
    .from("clientes")
    .update(clienteFields(formData))
    .eq("id", id);

  if (error) {
    redirect(
      `/clientes/${id}/editar?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCliente(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));

  await supabase.from("clientes").delete().eq("id", id);

  revalidatePath("/clientes");
}
