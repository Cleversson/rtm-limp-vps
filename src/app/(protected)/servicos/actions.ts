"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

function servicoFields(formData: FormData) {
  const precoRaw = String(formData.get("preco") ?? "").replace(",", ".");
  const duracaoRaw = formData.get("duracao_minutos");

  return {
    nome: String(formData.get("nome") ?? ""),
    descricao: nullableString(formData.get("descricao")),
    categoria: nullableString(formData.get("categoria")),
    preco: Number(precoRaw),
    duracao_minutos: duracaoRaw ? Number(duracaoRaw) : null,
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

export async function createServico(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/servicos?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const { error } = await supabase.from("servicos").insert({
    empresa_id: usuario.empresa_id,
    ...servicoFields(formData),
  });

  if (error) {
    redirect(`/servicos/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function updateServico(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const { error } = await supabase
    .from("servicos")
    .update(servicoFields(formData))
    .eq("id", id);

  if (error) {
    redirect(
      `/servicos/${id}/editar?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function deleteServico(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));

  await supabase.from("servicos").delete().eq("id", id);

  revalidatePath("/servicos");
}

export async function toggleServicoAtivo(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));
  const ativo = formData.get("ativo") === "true";

  await supabase.from("servicos").update({ ativo: !ativo }).eq("id", id);

  revalidatePath("/servicos");
}
