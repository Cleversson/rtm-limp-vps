"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function produtoFields(formData: FormData) {
  const precoRaw = String(formData.get("preco_compra") ?? "").replace(",", ".");
  const volumeRaw = String(formData.get("volume_ml") ?? "").replace(",", ".");

  return {
    nome: String(formData.get("nome") ?? ""),
    preco_compra: Number(precoRaw) || 0,
    volume_ml: Number(volumeRaw) || 0,
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

export async function createProduto(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/produtos?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const { error } = await supabase.from("produtos").insert({
    empresa_id: usuario.empresa_id,
    ...produtoFields(formData),
  });

  if (error) {
    redirect(`/produtos/novo?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function updateProduto(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const { error } = await supabase
    .from("produtos")
    .update(produtoFields(formData))
    .eq("id", id);

  if (error) {
    redirect(
      `/produtos/${id}/editar?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function deleteProduto(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));

  await supabase.from("produtos").delete().eq("id", id);

  revalidatePath("/produtos");
}

export async function duplicarProduto(formData: FormData) {
  const { supabase, userId } = await requireSupabase();
  const id = String(formData.get("id"));

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/produtos?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const { data: produto } = await supabase
    .from("produtos")
    .select("nome, preco_compra, volume_ml")
    .eq("id", id)
    .maybeSingle();

  if (!produto) {
    redirect(`/produtos?error=${encodeURIComponent("Produto não encontrado.")}`);
  }

  const { error } = await supabase.from("produtos").insert({
    empresa_id: usuario.empresa_id,
    nome: `${produto.nome} (cópia)`,
    preco_compra: produto.preco_compra,
    volume_ml: produto.volume_ml,
  });

  if (error) {
    redirect(`/produtos?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/produtos");
}
