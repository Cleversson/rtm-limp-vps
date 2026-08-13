"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

function transacaoFields(formData: FormData) {
  return {
    tipo: String(formData.get("tipo") ?? "entrada"),
    descricao: String(formData.get("descricao") ?? ""),
    categoria: nullableString(formData.get("categoria")),
    valor: Number(String(formData.get("valor") ?? "").replace(",", ".")),
    data: String(formData.get("data") ?? ""),
    cliente_id: nullableString(formData.get("cliente_id")),
    agendamento_id: nullableString(formData.get("agendamento_id")),
    orcamento_id: nullableString(formData.get("orcamento_id")),
    forma_pagamento: nullableString(formData.get("forma_pagamento")),
    assinatura_id: nullableString(formData.get("assinatura_id")),
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

export async function createTransacao(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/financeiro?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const fields = transacaoFields(formData);

  const { error } = await supabase.from("transacoes").insert({
    empresa_id: usuario.empresa_id,
    ...fields,
  });

  if (error) {
    redirect(
      `/financeiro/novo?data=${fields.data}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/financeiro");
  redirect(`/financeiro?periodo=mensal&ref=${fields.data.slice(0, 7)}`);
}

export async function updateTransacao(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const fields = transacaoFields(formData);

  const { error } = await supabase
    .from("transacoes")
    .update(fields)
    .eq("id", id);

  if (error) {
    redirect(
      `/financeiro/${id}/editar?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/financeiro");
  redirect(`/financeiro?periodo=mensal&ref=${fields.data.slice(0, 7)}`);
}

export async function deleteTransacao(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));
  const data = String(formData.get("data") ?? "");

  await supabase.from("transacoes").delete().eq("id", id);

  revalidatePath("/financeiro");
  redirect(
    `/financeiro${data ? `?periodo=mensal&ref=${data.slice(0, 7)}` : ""}`,
  );
}
