"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

function agendamentoFields(formData: FormData) {
  return {
    cliente_id: String(formData.get("cliente_id") ?? ""),
    servico_id: nullableString(formData.get("servico_id")),
    data: String(formData.get("data") ?? ""),
    hora_inicio: String(formData.get("hora_inicio") ?? ""),
    hora_fim: nullableString(formData.get("hora_fim")),
    endereco: nullableString(formData.get("endereco")),
    numero: nullableString(formData.get("numero")),
    complemento: nullableString(formData.get("complemento")),
    bairro: nullableString(formData.get("bairro")),
    cidade: nullableString(formData.get("cidade")),
    estado: nullableString(formData.get("estado")),
    cep: nullableString(formData.get("cep")),
    status: String(formData.get("status") ?? "agendado"),
    observacoes: nullableString(formData.get("observacoes")),
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

export async function createAgendamento(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/agenda?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const fields = agendamentoFields(formData);

  const { error } = await supabase.from("agendamentos").insert({
    empresa_id: usuario.empresa_id,
    ...fields,
  });

  if (error) {
    redirect(
      `/agenda/novo?dia=${fields.data}&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/agenda");
  redirect(`/agenda?dia=${fields.data}`);
}

export async function updateAgendamento(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const fields = agendamentoFields(formData);

  const { error } = await supabase
    .from("agendamentos")
    .update(fields)
    .eq("id", id);

  if (error) {
    redirect(
      `/agenda/${id}/editar?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/agenda");
  redirect(`/agenda?dia=${fields.data}`);
}

export async function deleteAgendamento(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));
  const data = String(formData.get("data") ?? "");

  await supabase.from("agendamentos").delete().eq("id", id);

  revalidatePath("/agenda");
  redirect(`/agenda${data ? `?dia=${data}` : ""}`);
}
