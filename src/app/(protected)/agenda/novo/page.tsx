import Link from "next/link";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { createAgendamento } from "../actions";
import { AgendamentoForm } from "../agendamento-form";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string; error?: string }>;
}) {
  const { dia, error } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/agenda" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Novo agendamento
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar a
          agenda nesta fase.
        </p>
      </div>
    );
  }

  const [{ data: clientes }, { data: servicos }] = await Promise.all([
    supabase
      .from("clientes")
      .select(
        "id, nome, endereco, numero, complemento, bairro, cidade, estado, cep",
      )
      .eq("empresa_id", usuario.empresa_id)
      .order("nome"),
    supabase
      .from("servicos")
      .select("id, nome, duracao_minutos")
      .eq("empresa_id", usuario.empresa_id)
      .eq("ativo", true)
      .order("nome"),
  ]);

  if (!clientes || clientes.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/agenda" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Novo agendamento
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Você ainda não tem nenhum cliente cadastrado. Cadastre um cliente
          antes de criar um agendamento.
        </p>
        <Link
          href="/clientes/novo"
          className="mt-4 inline-block h-12 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Cadastrar cliente
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/agenda" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Novo agendamento
        </h1>
      </div>
      <AgendamentoForm
        action={createAgendamento}
        clientes={clientes}
        servicos={servicos ?? []}
        defaultValues={{ data: dia }}
        error={error}
        submitLabel="Criar agendamento"
      />
    </div>
  );
}
