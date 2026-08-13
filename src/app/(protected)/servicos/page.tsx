import Link from "next/link";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { deleteServico, toggleServicoAtivo } from "./actions";
import { BotaoExcluir } from "@/components/botao-excluir";

type Servico = {
  id: string;
  nome: string;
  categoria: string | null;
  preco: number | string;
  duracao_minutos: number | null;
  ativo: boolean;
};

export default async function ServicosPage() {
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Serviços
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar serviços
          nesta fase.
        </p>
      </div>
    );
  }

  const { data: servicos } = await supabase
    .from("servicos")
    .select("id, nome, categoria, preco, duracao_minutos, ativo")
    .eq("empresa_id", usuario.empresa_id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Serviços
          </h1>
        </div>
        <Link
          href="/servicos/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Novo serviço
        </Link>
      </div>

      {!servicos || servicos.length === 0 ? (
        <p className="mt-6 text-slate-600 dark:text-slate-400">
          Nenhum serviço cadastrado ainda.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Categoria</th>
                <th className="px-4 py-2">Preço</th>
                <th className="px-4 py-2">Duração</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(servicos as Servico[]).map((servico) => (
                <tr
                  key={servico.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                    {servico.nome}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {servico.categoria ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {Number(servico.preco).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">
                    {servico.duracao_minutos
                      ? `${servico.duracao_minutos} min`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        servico.ativo
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {servico.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      <Link
                        href={`/servicos/${servico.id}/editar`}
                        className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                      >
                        Editar
                      </Link>
                      <form action={toggleServicoAtivo}>
                        <input type="hidden" name="id" value={servico.id} />
                        <input
                          type="hidden"
                          name="ativo"
                          value={String(servico.ativo)}
                        />
                        <button
                          type="submit"
                          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                        >
                          {servico.ativo ? "Desativar" : "Ativar"}
                        </button>
                      </form>
                      <form action={deleteServico}>
                        <input type="hidden" name="id" value={servico.id} />
                        <BotaoExcluir
                          mensagemConfirmacao={`Excluir ${servico.nome}? Esta ação não pode ser desfeita.`}
                          className="text-sm text-red-600 hover:underline dark:text-red-400"
                        >
                          Excluir
                        </BotaoExcluir>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
