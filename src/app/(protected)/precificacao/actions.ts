"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function numero(value: FormDataEntryValue | null): number {
  return Number(String(value ?? "0").replace(",", ".")) || 0;
}

function itensDaLista(
  formData: FormData,
  campoNome: string,
  campoValor: string,
): { nome: string; valor: number }[] {
  const nomes = formData.getAll(campoNome);
  const valores = formData.getAll(campoValor);
  const itens: { nome: string; valor: number }[] = [];

  nomes.forEach((nome, i) => {
    const nomeTexto = String(nome ?? "").trim();
    if (!nomeTexto) return;
    itens.push({
      nome: nomeTexto,
      valor: Number(String(valores[i] ?? "0").replace(",", ".")) || 0,
    });
  });

  return itens;
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

export async function calcularPreco(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/precificacao?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const custosFixosItens = itensDaLista(
    formData,
    "custoFixoNome",
    "custoFixoValor",
  );
  const custosVariaveisItens = itensDaLista(
    formData,
    "custoVariavelNome",
    "custoVariavelValor",
  );
  const totalFixos = custosFixosItens.reduce((s, i) => s + i.valor, 0);
  const totalVariaveis = custosVariaveisItens.reduce((s, i) => s + i.valor, 0);

  const horas = numero(formData.get("horas"));
  const duracao = numero(formData.get("duracao"));
  const margem = numero(formData.get("margem"));
  const taxaMaquininha = numero(formData.get("taxaMaquininha"));
  const taxaPix = numero(formData.get("taxaPix"));

  await supabase
    .from("empresas")
    .update({
      custos_fixos_itens: custosFixosItens,
      horas_produtivas_mes: horas,
      margem_lucro_padrao: margem,
      taxa_maquininha_padrao: taxaMaquininha,
      taxa_pix_padrao: taxaPix,
    })
    .eq("id", usuario.empresa_id);

  const params = new URLSearchParams({
    totalFixos: String(totalFixos),
    horas: String(horas),
    totalVariaveis: String(totalVariaveis),
    duracao: String(duracao),
    margem: String(margem),
    taxaMaquininha: String(taxaMaquininha),
    taxaPix: String(taxaPix),
  });

  redirect(`/precificacao/resultado?${params.toString()}`);
}

export async function salvarComoServico(formData: FormData) {
  const { supabase, userId } = await requireSupabase();

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", userId)
    .maybeSingle();

  if (!usuario?.empresa_id) {
    redirect(
      `/precificacao?error=${encodeURIComponent(
        "Nenhuma empresa vinculada a este usuário.",
      )}`,
    );
  }

  const nome = String(formData.get("nome") ?? "");
  const preco = numero(formData.get("preco"));
  const duracaoHoras = numero(formData.get("duracao"));

  const { error } = await supabase.from("servicos").insert({
    empresa_id: usuario.empresa_id,
    nome,
    preco,
    duracao_minutos: Math.round(duracaoHoras * 60) || null,
    ativo: true,
  });

  if (error) {
    redirect(
      `/precificacao?error=${encodeURIComponent(
        "Não foi possível salvar o serviço: " + error.message,
      )}`,
    );
  }

  revalidatePath("/servicos");
  redirect("/servicos");
}
