import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import {
  STATUS_ORCAMENTO_CLASSES,
  STATUS_ORCAMENTO_LABEL,
  STATUS_ORCAMENTO_OPTIONS,
  calcularTotalOrcamento,
  type TipoDesconto,
} from "@/lib/orcamento";

type OrcamentoListItem = {
  id: string;
  numero: number;
  status: string;
  desconto: number | string;
  desconto_tipo: TipoDesconto;
  created_at: string;
  clientes: { nome: string } | null;
  orcamento_itens: { quantidade: number; valor_unitario: number | string }[];
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/financeiro" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Orçamentos
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar
          orçamentos nesta fase.
        </p>
      </div>
    );
  }

  let query = supabase
    .from("orcamentos")
    .select(
      "id, numero, status, desconto, desconto_tipo, created_at, clientes(nome), orcamento_itens(quantidade, valor_unitario)",
    )
    .eq("empresa_id", usuario.empresa_id)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orcamentos } = await query;
  const lista = (orcamentos ?? []) as unknown as OrcamentoListItem[];

  const ids = lista.map((o) => o.id);
  const { data: fotosRaw } =
    ids.length > 0
      ? await supabase
          .from("orcamento_fotos")
          .select("orcamento_id, url")
          .in("orcamento_id", ids)
      : { data: [] as { orcamento_id: string; url: string }[] };

  const fotosPorOrcamento = new Map<string, string[]>();
  for (const f of fotosRaw ?? []) {
    const atual = fotosPorOrcamento.get(f.orcamento_id) ?? [];
    atual.push(f.url);
    fotosPorOrcamento.set(f.orcamento_id, atual);
  }

  const filtros: { value?: string; label: string }[] = [
    { value: undefined, label: "Todos" },
    ...STATUS_ORCAMENTO_OPTIONS,
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/financeiro" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Orçamentos
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Propostas enviadas aos seus clientes.
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto">
        {filtros.map((f) => (
          <Link
            key={f.label}
            href={f.value ? `/orcamentos?status=${f.value}` : "/orcamentos"}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              status === f.value || (!status && !f.value)
                ? "bg-slate-900 text-white dark:bg-slate-700"
                : "border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
          Nenhum orçamento encontrado.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {lista.map((o) => {
            const subtotal = o.orcamento_itens.reduce(
              (s, i) => s + i.quantidade * Number(i.valor_unitario),
              0,
            );
            const total = calcularTotalOrcamento(
              subtotal,
              Number(o.desconto),
              o.desconto_tipo,
            );
            const fotos = fotosPorOrcamento.get(o.id) ?? [];
            return (
              <Link
                key={o.id}
                href={`/orcamentos/${o.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {fotos.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fotos[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                    {fotos.length > 1 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white dark:bg-slate-700">
                        {fotos.length}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      #{o.numero} · {o.clientes?.nome ?? "Cliente removido"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(o.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatarMoeda(total)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_ORCAMENTO_CLASSES[o.status] ??
                      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {STATUS_ORCAMENTO_LABEL[o.status] ?? o.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href="/orcamentos/novo"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-90 dark:bg-slate-700"
        aria-label="Novo orçamento"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
