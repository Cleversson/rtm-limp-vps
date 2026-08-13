import Link from "next/link";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { deleteAssinatura } from "./actions";
import { BotaoExcluir } from "@/components/botao-excluir";

export default async function AssinaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Assinaturas
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar
          assinaturas nesta fase.
        </p>
      </div>
    );
  }

  const { data: assinaturas } = await supabase
    .from("assinaturas")
    .select("id, nome, imagem_url")
    .eq("empresa_id", usuario.empresa_id)
    .order("nome");

  const lista = assinaturas ?? [];

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/ajustes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Assinaturas
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Cadastre imagens de assinatura para usar no rodapé dos recibos.
      </p>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Assinaturas cadastradas
        </h2>
        <Link
          href="/assinaturas/novo"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Nova assinatura
        </Link>
      </div>

      {lista.length === 0 ? (
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400">
          Nenhuma assinatura cadastrada ainda.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {lista.map((assinatura) => (
            <div
              key={assinatura.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <Link
                href={`/assinaturas/${assinatura.id}/editar`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={assinatura.imagem_url}
                  alt={assinatura.nome}
                  className="h-12 w-20 rounded-md border border-slate-200 object-contain bg-white dark:border-slate-800"
                />
                <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                  {assinatura.nome}
                </span>
              </Link>
              <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
                <Link
                  href={`/assinaturas/${assinatura.id}/editar`}
                  className="text-sm text-slate-600 hover:underline dark:text-slate-400"
                >
                  Editar
                </Link>
                <form action={deleteAssinatura}>
                  <input type="hidden" name="id" value={assinatura.id} />
                  <BotaoExcluir
                    mensagemConfirmacao={`Excluir ${assinatura.nome}? Esta ação não pode ser desfeita.`}
                    className="text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Excluir
                  </BotaoExcluir>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
