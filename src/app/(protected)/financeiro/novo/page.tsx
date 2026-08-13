import { getUsuarioAtual } from "@/lib/supabase/auth";
import { hojeBrasilia } from "@/lib/data-brasil";
import { calcularTotalOrcamento } from "@/lib/orcamento";
import { BotaoVoltar } from "@/components/botao-voltar";
import { createTransacao } from "../actions";
import { TransacaoForm, type TransacaoFormValues } from "../transacao-form";

export default async function NovaTransacaoPage({
  searchParams,
}: {
  searchParams: Promise<{
    data?: string;
    agendamento_id?: string;
    orcamento_id?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/financeiro" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Nova transação
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar o
          financeiro nesta fase.
        </p>
      </div>
    );
  }

  const [{ data: clientes }, { data: assinaturas }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome")
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
    supabase
      .from("assinaturas")
      .select("id, nome")
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
  ]);

  let defaultValues: TransacaoFormValues = {
    data: params.data ?? hojeBrasilia(),
  };

  if (params.agendamento_id) {
    const { data: agendamento } = await supabase
      .from("agendamentos")
      .select("id, data, cliente_id, servicos(nome, categoria, preco)")
      .eq("id", params.agendamento_id)
      .maybeSingle();

    if (agendamento) {
      const servico = agendamento.servicos as unknown as {
        nome: string;
        categoria: string | null;
        preco: number | string;
      } | null;

      defaultValues = {
        tipo: "entrada",
        descricao: servico?.nome ?? "Atendimento",
        categoria: "outros",
        valor: servico?.preco ?? "",
        data: agendamento.data,
        cliente_id: agendamento.cliente_id,
        agendamento_id: agendamento.id,
      };
    }
  }

  if (params.orcamento_id) {
    const { data: orcamento } = await supabase
      .from("orcamentos")
      .select(
        "id, numero, cliente_id, desconto, desconto_tipo, orcamento_itens(quantidade, valor_unitario)",
      )
      .eq("id", params.orcamento_id)
      .maybeSingle();

    if (orcamento) {
      const subtotal = orcamento.orcamento_itens.reduce(
        (s, i) => s + i.quantidade * Number(i.valor_unitario),
        0,
      );
      const total = calcularTotalOrcamento(
        subtotal,
        Number(orcamento.desconto),
        orcamento.desconto_tipo as "fixo" | "percentual",
      );

      defaultValues = {
        tipo: "entrada",
        descricao: `Orçamento #${orcamento.numero}`,
        categoria: "outros",
        valor: total,
        data: hojeBrasilia(),
        cliente_id: orcamento.cliente_id,
        orcamento_id: orcamento.id,
      };
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/financeiro" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Nova transação
        </h1>
      </div>
      <TransacaoForm
        action={createTransacao}
        clientes={clientes ?? []}
        assinaturas={assinaturas ?? []}
        defaultValues={defaultValues}
        error={params.error}
        submitLabel="Salvar transação"
      />
    </div>
  );
}
