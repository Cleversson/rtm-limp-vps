import { notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import {
  adicionarFotosOrcamento,
  deleteOrcamento,
  excluirFotoOrcamento,
  updateOrcamento,
} from "../../actions";
import { OrcamentoForm } from "../../orcamento-form";
import { GaleriaFotos } from "@/components/galeria-fotos";
import { FotosOrcamentoField } from "@/components/fotos-orcamento-field";
import { BotaoExcluir } from "@/components/botao-excluir";
import { MAX_FOTOS_ORCAMENTO } from "@/lib/orcamento";

export default async function EditarOrcamentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: errorParam } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  const { data: orcamento } = await supabase
    .from("orcamentos")
    .select(
      "id, numero, cliente_id, desconto, desconto_tipo, observacoes, orcamento_itens(servico_id, nome, quantidade, valor_unitario), orcamento_fotos(id, url)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!orcamento) {
    notFound();
  }

  const [{ data: clientes }, { data: servicos }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome")
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .order("nome"),
    supabase
      .from("servicos")
      .select("id, nome, preco")
      .eq("empresa_id", usuario?.empresa_id ?? "")
      .eq("ativo", true)
      .order("nome"),
  ]);

  const updateOrcamentoComId = updateOrcamento.bind(null, id);
  const adicionarFotosComId = adicionarFotosOrcamento.bind(null, id);
  const fotos = orcamento.orcamento_fotos;
  const totalFotos = fotos.length;
  const podeAdicionarFotos = totalFotos < MAX_FOTOS_ORCAMENTO;

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href={`/orcamentos/${id}`} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Editar orçamento
        </h1>
      </div>
      <OrcamentoForm
        action={updateOrcamentoComId}
        clientes={clientes ?? []}
        servicos={servicos ?? []}
        defaultValues={{
          cliente_id: orcamento.cliente_id,
          desconto: orcamento.desconto,
          desconto_tipo: orcamento.desconto_tipo as "fixo" | "percentual",
          observacoes: orcamento.observacoes,
          itens: orcamento.orcamento_itens,
        }}
        error={errorParam}
        submitLabel="Salvar alterações"
      />

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Fotos
        </span>
        <GaleriaFotos fotos={fotos} actionExcluir={excluirFotoOrcamento} />
        {podeAdicionarFotos ? (
          <form action={adicionarFotosComId}>
            <FotosOrcamentoField max={MAX_FOTOS_ORCAMENTO - totalFotos} />
            <button
              type="submit"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Adicionar fotos
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Limite de {MAX_FOTOS_ORCAMENTO} fotos atingido.
          </p>
        )}
      </div>

      <form action={deleteOrcamento} className="mt-4">
        <input type="hidden" name="id" value={orcamento.id} />
        <BotaoExcluir
          mensagemConfirmacao={`Excluir o orçamento #${orcamento.numero}? Esta ação não pode ser desfeita.`}
          className="h-12 w-full rounded-lg border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Excluir orçamento
        </BotaoExcluir>
      </form>
    </div>
  );
}
