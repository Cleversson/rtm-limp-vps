import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { whatsappLink } from "@/lib/whatsapp";
import { adicionarMeses } from "@/lib/data-brasil";
import { deleteCliente } from "./actions";
import { BotaoExcluir } from "@/components/botao-excluir";

type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  cidade: string | null;
  estado: string | null;
  recorrencia_meses: number;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Clientes
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar
          clientes nesta fase.
        </p>
      </div>
    );
  }

  let query = supabase
    .from("clientes")
    .select("id, nome, telefone, cidade, estado, recorrencia_meses")
    .eq("empresa_id", usuario.empresa_id)
    .order("nome");

  if (q) {
    query = query.or(`nome.ilike.%${q}%,telefone.ilike.%${q}%`);
  }

  const [{ data: clientes }, { data: agendamentosConcluidos }] =
    await Promise.all([
      query,
      supabase
        .from("agendamentos")
        .select("cliente_id, data")
        .eq("empresa_id", usuario.empresa_id)
        .eq("status", "concluido"),
    ]);

  const ultimaVisitaPorCliente = new Map<string, string>();
  for (const ag of agendamentosConcluidos ?? []) {
    const atual = ultimaVisitaPorCliente.get(ag.cliente_id);
    if (!atual || ag.data > atual) {
      ultimaVisitaPorCliente.set(ag.cliente_id, ag.data);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Meus Clientes
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Gerencie sua base de contatos.
      </p>

      <form className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou telefone..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
        />
      </form>

      {!clientes || clientes.length === 0 ? (
        <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
          {q ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {(clientes as Cliente[]).map((cliente) => {
            const ultimaVisita = ultimaVisitaPorCliente.get(cliente.id);
            const proximaHigienizacao = ultimaVisita
              ? adicionarMeses(ultimaVisita, cliente.recorrencia_meses)
              : null;

            return (
            <div
              key={cliente.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <Link
                href={`/clientes/${cliente.id}/editar`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  {getInitials(cliente.nome)}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                    {cliente.nome}
                  </span>
                  {(cliente.cidade || cliente.estado) && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {[cliente.cidade, cliente.estado]
                        .filter(Boolean)
                        .join(" - ")}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {cliente.telefone}
                  </span>
                  {proximaHigienizacao ? (
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarClock className="h-3 w-3" />
                      Próxima higienização:{" "}
                      {new Date(
                        `${proximaHigienizacao}T00:00:00`,
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Sem atendimentos registrados
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <a
                  href={whatsappLink(cliente.telefone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400"
                  aria-label={`Abrir WhatsApp com ${cliente.nome}`}
                >
                  <MessageCircle className="h-5 w-5" />
                </a>
                <form action={deleteCliente}>
                  <input type="hidden" name="id" value={cliente.id} />
                  <BotaoExcluir
                    mensagemConfirmacao={`Excluir ${cliente.nome}? Esta ação não pode ser desfeita.`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    aria-label={`Excluir ${cliente.nome}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </BotaoExcluir>
                </form>
                <Link
                  href={`/clientes/${cliente.id}/editar`}
                  className="flex h-10 w-10 items-center justify-center text-slate-400 dark:text-slate-500"
                  aria-label={`Editar ${cliente.nome}`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <Link
        href="/clientes/novo"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-90 dark:bg-slate-700"
        aria-label="Novo cliente"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
