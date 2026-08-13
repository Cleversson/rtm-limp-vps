"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

function nullableString(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}

function fotosFromFormData(formData: FormData): File[] {
  return formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0);
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${file.type || "image/jpeg"};base64,${btoa(binary)}`;
}

async function uploadFotosOrcamento(
  supabase: SupabaseClient,
  empresaId: string,
  orcamentoId: string,
  files: File[],
): Promise<{ falhas: number }> {
  let falhas = 0;

  for (const file of files) {
    const fotoId = crypto.randomUUID();
    try {
      const base64Url = await fileToBase64(file);
      const { error: insertError } = await supabase.from("orcamento_fotos").insert({
        orcamento_id: orcamentoId,
        path: `${empresaId}/orcamentos/${orcamentoId}/${fotoId}.jpg`,
        url: base64Url,
      });
      if (insertError) {
        console.error("Erro ao salvar foto do orcamento:", insertError);
        falhas++;
      }
    } catch (err) {
      console.error("Erro ao processar foto do orcamento:", err);
      falhas++;
    }
  }

  return { falhas };
}

function itensFromFormData(formData: FormData) {
  const nomes = formData.getAll("itemNome");
  const quantidades = formData.getAll("itemQuantidade");
  const valores = formData.getAll("itemValor");
  const servicoIds = formData.getAll("itemServicoId");

  return nomes
    .map((nome, i) => ({
      nome: String(nome).trim(),
      quantidade: Number(quantidades[i] ?? 1) || 1,
      valor_unitario: Number(String(valores[i] ?? "0").replace(",", ".")) || 0,
      servico_id: nullableString(servicoIds[i] ?? null),
    }))
    .filter((item) => item.nome.length > 0);
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

export async function createOrcamento(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/orcamentos?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const itens = itensFromFormData(formData);
  if (itens.length === 0) {
    redirect(
      `/orcamentos/novo?error=${encodeURIComponent("Adicione pelo menos um item.")}`,
    );
  }

  const clienteId = String(formData.get("cliente_id") ?? "");
  const desconto = Number(String(formData.get("desconto") ?? "0").replace(",", ".")) || 0;
  const descontoTipo = String(formData.get("desconto_tipo") ?? "fixo");
  const observacoes = nullableString(formData.get("observacoes"));

  const { data: orcamento, error } = await supabase
    .from("orcamentos")
    .insert({
      empresa_id: usuario.empresa_id,
      cliente_id: clienteId,
      desconto,
      desconto_tipo: descontoTipo,
      observacoes,
    })
    .select("id")
    .single();

  if (error || !orcamento) {
    redirect(
      `/orcamentos/novo?error=${encodeURIComponent(
        error?.message ?? "Erro ao criar orçamento.",
      )}`,
    );
    return;
  }

  const { error: itensError } = await supabase
    .from("orcamento_itens")
    .insert(itens.map((item) => ({ orcamento_id: orcamento.id, ...item })));

  if (itensError) {
    redirect(`/orcamentos/novo?error=${encodeURIComponent(itensError.message)}`);
  }

  const fotos = fotosFromFormData(formData);
  let erroFotos = "";
  if (fotos.length > 0) {
    const { falhas } = await uploadFotosOrcamento(
      supabase,
      usuario.empresa_id,
      orcamento.id,
      fotos,
    );
    if (falhas > 0) {
      erroFotos = `?error=${encodeURIComponent(
        "Orçamento criado, mas algumas fotos não puderam ser enviadas.",
      )}`;
    }
  }

  revalidatePath("/orcamentos");
  redirect(`/orcamentos/${orcamento.id}${erroFotos}`);
}

export async function updateOrcamento(id: string, formData: FormData) {
  const { supabase } = await requireSupabase();

  const itens = itensFromFormData(formData);
  if (itens.length === 0) {
    redirect(
      `/orcamentos/${id}/editar?error=${encodeURIComponent(
        "Adicione pelo menos um item.",
      )}`,
    );
  }

  const clienteId = String(formData.get("cliente_id") ?? "");
  const desconto = Number(String(formData.get("desconto") ?? "0").replace(",", ".")) || 0;
  const descontoTipo = String(formData.get("desconto_tipo") ?? "fixo");
  const observacoes = nullableString(formData.get("observacoes"));

  const { error } = await supabase
    .from("orcamentos")
    .update({
      cliente_id: clienteId,
      desconto,
      desconto_tipo: descontoTipo,
      observacoes,
    })
    .eq("id", id);

  if (error) {
    redirect(`/orcamentos/${id}/editar?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("orcamento_itens").delete().eq("orcamento_id", id);

  const { error: itensError } = await supabase
    .from("orcamento_itens")
    .insert(itens.map((item) => ({ orcamento_id: id, ...item })));

  if (itensError) {
    redirect(
      `/orcamentos/${id}/editar?error=${encodeURIComponent(itensError.message)}`,
    );
  }

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  redirect(`/orcamentos/${id}`);
}

export async function updateStatusOrcamento(formData: FormData) {
  const { supabase } = await requireSupabase();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const motivoCancelamento = nullableString(formData.get("motivo_cancelamento"));

  if (status === "cancelado" && !motivoCancelamento) {
    redirect(
      `/orcamentos/${id}?error=${encodeURIComponent(
        "Informe o motivo do cancelamento.",
      )}`,
    );
  }

  const { error } = await supabase
    .from("orcamentos")
    .update({
      status,
      ...(status === "cancelado" ? { motivo_cancelamento: motivoCancelamento } : {}),
    })
    .eq("id", id);

  if (error) {
    redirect(`/orcamentos/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/orcamentos");
  revalidatePath(`/orcamentos/${id}`);
  redirect(`/orcamentos/${id}`);
}

export async function adicionarFotosOrcamento(orcamentoId: string, formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/orcamentos/${orcamentoId}/editar?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const fotos = fotosFromFormData(formData);
  if (fotos.length > 0) {
    const { falhas } = await uploadFotosOrcamento(
      supabase,
      usuario.empresa_id,
      orcamentoId,
      fotos,
    );
    if (falhas > 0) {
      redirect(
        `/orcamentos/${orcamentoId}/editar?error=${encodeURIComponent(
          "Algumas fotos não puderam ser enviadas.",
        )}`,
      );
    }
  }

  revalidatePath(`/orcamentos/${orcamentoId}/editar`);
  revalidatePath(`/orcamentos/${orcamentoId}`);
  redirect(`/orcamentos/${orcamentoId}/editar`);
}

export async function excluirFotoOrcamento(formData: FormData) {
  const { supabase } = await requireSupabase();
  const fotoId = String(formData.get("foto_id"));

  const { data: foto } = await supabase
    .from("orcamento_fotos")
    .select("id, path, orcamento_id")
    .eq("id", fotoId)
    .maybeSingle();

  if (!foto) {
    redirect("/orcamentos");
    return;
  }

  const { error: storageError } = await supabase.storage
    .from("documentos")
    .remove([foto.path]);

  if (storageError) {
    console.error("Erro ao remover foto do orçamento do Storage:", storageError);
  }

  const { error: deleteError } = await supabase
    .from("orcamento_fotos")
    .delete()
    .eq("id", fotoId);

  if (deleteError) {
    redirect(
      `/orcamentos/${foto.orcamento_id}/editar?error=${encodeURIComponent(deleteError.message)}`,
    );
  }

  revalidatePath(`/orcamentos/${foto.orcamento_id}/editar`);
  revalidatePath(`/orcamentos/${foto.orcamento_id}`);
  redirect(`/orcamentos/${foto.orcamento_id}/editar`);
}

export async function deleteOrcamento(formData: FormData) {
  const { supabase, userId } = await requireSupabase();
  const id = String(formData.get("id"));

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (usuario?.empresa_id) {
    const prefixo = `${usuario.empresa_id}/orcamentos/${id}`;
    const { data: arquivos, error: listError } = await supabase.storage
      .from("documentos")
      .list(prefixo);

    if (listError) {
      console.error("Erro ao listar fotos do orçamento no Storage:", listError);
    } else if (arquivos && arquivos.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("documentos")
        .remove(arquivos.map((a) => `${prefixo}/${a.name}`));
      if (removeError) {
        console.error("Erro ao remover fotos do orçamento do Storage:", removeError);
      }
    }
  }

  await supabase.from("orcamentos").delete().eq("id", id);

  revalidatePath("/orcamentos");
  redirect("/orcamentos");
}
