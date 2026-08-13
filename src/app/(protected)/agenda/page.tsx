import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Plus, Search } from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { hojeBrasilia } from "@/lib/data-brasil";
import { resolverPeriodo, type PeriodoSearchParams } from "@/lib/periodo";
import { PeriodoSeletor } from "@/components/periodo-seletor";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Calendario } from "./calendario";
import { GraficoBairros, type FatiaContagem } from "./grafico-bairros";
import { RankingServicos, type ItemRanking } from "./ranking-servicos";

type Agendamento = {
  id: string;
  hora_inicio: string;
  hora_fim: string | null;
  status: string;
  cidade: string | null;
  estado: string | null;
  clientes: { nome: string } | null;
  servicos: { nome: string } | null;
};

type AgendamentoComData = Agendamento & { data: string };

type AgendamentoRanking = {
  bairro: string | null;
  servico_id: string | null;
  servicos: { nome: string } | null;
};

const NAO_INFORMADO = "Não informado";
const SEM_SERVICO = "Sem serviço específico";
const COR_OUTROS = "#94a3b8";
// 5 primeiras cores da paleta categórica já validada pela skill de dataviz
// (mesma sequência de src/app/(protected)/financeiro/categorias.ts).
const PALETA_CATEGORICA = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];

function contarPorChave<T>(itens: T[], chave: (item: T) => string): Map<string, number> {
  const mapa = new Map<string, number>();
  for (const item of itens) {
    const k = chave(item);
    mapa.set(k, (mapa.get(k) ?? 0) + 1);
  }
  return mapa;
}

function topNComOutros(
  mapa: Map<string, number>,
  n: number,
): { label: string; valor: number }[] {
  const ordenado = Array.from(mapa.entries())
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor);
  const top = ordenado.slice(0, n);
  const resto = ordenado.slice(n).reduce((s, i) => s + i.valor, 0);
  return resto > 0 ? [...top, { label: "Outros", valor: resto }] : top;
}

function calcularRanking(
  raw: unknown,
): { bairrosTop: FatiaContagem[]; servicosTop: ItemRanking[] } {
  const lista = (raw ?? []) as unknown as AgendamentoRanking[];

  const bairrosContagem = contarPorChave(
    lista,
    (ag) => ag.bairro?.trim() || NAO_INFORMADO,
  );
  const bairrosTop: FatiaContagem[] = topNComOutros(bairrosContagem, 5).map((b, i) => ({
    ...b,
    cor: b.label === "Outros" ? COR_OUTROS : PALETA_CATEGORICA[i % PALETA_CATEGORICA.length],
  }));

  const servicosContagem = contarPorChave(
    lista,
    (ag) => ag.servicos?.nome ?? SEM_SERVICO,
  );
  const servicosTop: ItemRanking[] = Array.from(servicosContagem.entries())
    .map(([label, valor]) => ({ label, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return { bairrosTop, servicosTop };
}

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  pendente: "Pendente",
  concluido: "Concluído",
};

const STATUS_CLASSES: Record<string, string> = {
  agendado: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  confirmado:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  pendente: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  concluido: "bg-slate-900 text-white dark:bg-slate-700",
};

function formatarDataLegivel(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatarDataCurta(dataStr: string): string {
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function AgendamentoCard({
  agendamento,
  mostrarData,
}: {
  agendamento: AgendamentoComData;
  mostrarData?: boolean;
}) {
  return (
    <Link
      href={`/agenda/${agendamento.id}/editar`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {agendamento.clientes?.nome ?? "Cliente"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            {mostrarData && `${formatarDataCurta(agendamento.data)} · `}
            {agendamento.hora_inicio.slice(0, 5)}
            {agendamento.hora_fim ? ` - ${agendamento.hora_fim.slice(0, 5)}` : ""}
          </p>
          {agendamento.servicos?.nome && (
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {agendamento.servicos.nome}
            </p>
          )}
          {(agendamento.cidade || agendamento.estado) && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPin className="h-3 w-3" />
              {[agendamento.cidade, agendamento.estado]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_CLASSES[agendamento.status] ?? STATUS_CLASSES.agendado
          }`}
        >
          {STATUS_LABEL[agendamento.status] ?? agendamento.status}
        </span>
      </div>
    </Link>
  );
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<PeriodoSearchParams & { dia?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Agenda
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para gerenciar a
          agenda nesta fase.
        </p>
      </div>
    );
  }

  const buscaForm = (
    <form className="relative mt-4">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="text"
        name="q"
        defaultValue={q ?? ""}
        placeholder="Buscar agendamento por cliente..."
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
      />
    </form>
  );

  if (q) {
    const { data: clientesEncontrados } = await supabase
      .from("clientes")
      .select("id")
      .eq("empresa_id", usuario.empresa_id)
      .ilike("nome", `%${q}%`);

    const idsClientes = (clientesEncontrados ?? []).map((c) => c.id);

    const { data: resultados } =
      idsClientes.length > 0
        ? await supabase
            .from("agendamentos")
            .select(
              "id, data, hora_inicio, hora_fim, status, cidade, estado, clientes(nome), servicos(nome)",
            )
            .eq("empresa_id", usuario.empresa_id)
            .in("cliente_id", idsClientes)
            .order("data", { ascending: false })
            .order("hora_inicio", { ascending: false })
        : { data: [] };

    const listaBusca = (resultados ?? []) as unknown as AgendamentoComData[];

    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Agenda
        </h1>

        {buscaForm}

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/agenda"
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:underline dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver calendário
            </Link>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {listaBusca.length} resultado{listaBusca.length === 1 ? "" : "s"}
            </span>
          </div>

          {listaBusca.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400">
              Nenhum agendamento encontrado para &quot;{q}&quot;.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {listaBusca.map((ag) => (
                <AgendamentoCard key={ag.id} agendamento={ag} mostrarData />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  const hoje = hojeBrasilia();
  const periodo = resolverPeriodo(params, hoje);

  if (periodo.tipo === "mensal") {
    const [ano, mes] = periodo.ref.split("-").map(Number);
    const diaSelecionado =
      params.dia ?? (hoje.startsWith(periodo.ref) ? hoje : `${periodo.ref}-01`);

    const [{ data: eventosDoMes }, { data: agendamentos }, { data: rankingRaw }] =
      await Promise.all([
        supabase
          .from("agendamentos")
          .select("data")
          .eq("empresa_id", usuario.empresa_id)
          .gte("data", periodo.inicio)
          .lte("data", periodo.fim),
        supabase
          .from("agendamentos")
          .select(
            "id, hora_inicio, hora_fim, status, cidade, estado, clientes(nome), servicos(nome)",
          )
          .eq("empresa_id", usuario.empresa_id)
          .eq("data", diaSelecionado)
          .order("hora_inicio"),
        supabase
          .from("agendamentos")
          .select("bairro, servico_id, servicos(nome)")
          .eq("empresa_id", usuario.empresa_id)
          .in("status", ["confirmado", "concluido"])
          .gte("data", periodo.inicio)
          .lte("data", periodo.fim),
      ]);

    const diasComEvento = new Set(
      (eventosDoMes ?? []).map((e) => e.data as string),
    );

    const lista = (agendamentos ?? []) as unknown as Agendamento[];
    const { bairrosTop, servicosTop } = calcularRanking(rankingRaw);

    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Agenda
        </h1>

        {buscaForm}

        <PeriodoSeletor periodo={periodo} basePath="/agenda" />

        <div className="mt-4">
          <Calendario
            ano={ano}
            mes={mes}
            diaSelecionado={diaSelecionado}
            diasComEvento={diasComEvento}
            hoje={hoje}
          />
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize text-slate-900 dark:text-slate-100">
              {formatarDataLegivel(diaSelecionado)}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lista.length} agendado{lista.length === 1 ? "" : "s"}
            </span>
          </div>

          {lista.length === 0 ? (
            <p className="text-center text-slate-500 dark:text-slate-400">
              Nenhum agendamento neste dia.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {lista.map((ag) => (
                <AgendamentoCard
                  key={ag.id}
                  agendamento={{ ...ag, data: diaSelecionado }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-4 flex flex-col gap-4">
          <CollapsibleCard
            title="Bairros mais atendidos"
            subtitle={periodo.rotulo}
            storageKey="agenda:bairros-recolhido"
          >
            <GraficoBairros fatias={bairrosTop} />
          </CollapsibleCard>
          <CollapsibleCard
            title="Serviços mais realizados"
            subtitle={periodo.rotulo}
            storageKey="agenda:servicos-recolhido"
          >
            <RankingServicos itens={servicosTop} />
          </CollapsibleCard>
        </div>

        <Link
          href={`/agenda/novo?dia=${diaSelecionado}`}
          className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-90 dark:bg-slate-700"
          aria-label="Novo agendamento"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    );
  }

  const [{ data: agendamentosPeriodo }, { data: rankingRaw }] = await Promise.all([
    supabase
      .from("agendamentos")
      .select(
        "id, data, hora_inicio, hora_fim, status, cidade, estado, clientes(nome), servicos(nome)",
      )
      .eq("empresa_id", usuario.empresa_id)
      .gte("data", periodo.inicio)
      .lte("data", periodo.fim)
      .order("data", { ascending: false })
      .order("hora_inicio", { ascending: false }),
    supabase
      .from("agendamentos")
      .select("bairro, servico_id, servicos(nome)")
      .eq("empresa_id", usuario.empresa_id)
      .in("status", ["confirmado", "concluido"])
      .gte("data", periodo.inicio)
      .lte("data", periodo.fim),
  ]);

  const listaPeriodo = (agendamentosPeriodo ?? []) as unknown as AgendamentoComData[];
  const { bairrosTop, servicosTop } = calcularRanking(rankingRaw);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Agenda
      </h1>

      {buscaForm}

      <PeriodoSeletor periodo={periodo} basePath="/agenda" />

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Agendamentos do período
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {listaPeriodo.length} agendado{listaPeriodo.length === 1 ? "" : "s"}
          </span>
        </div>

        {listaPeriodo.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Nenhum agendamento neste período.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {listaPeriodo.map((ag) => (
              <AgendamentoCard key={ag.id} agendamento={ag} mostrarData />
            ))}
          </div>
        )}
      </section>

      <div className="mt-4 flex flex-col gap-4">
        <CollapsibleCard
          title="Bairros mais atendidos"
          subtitle={periodo.rotulo}
          storageKey="agenda:bairros-recolhido"
        >
          <GraficoBairros fatias={bairrosTop} />
        </CollapsibleCard>
        <CollapsibleCard
          title="Serviços mais realizados"
          subtitle={periodo.rotulo}
          storageKey="agenda:servicos-recolhido"
        >
          <RankingServicos itens={servicosTop} />
        </CollapsibleCard>
      </div>

      <Link
        href={`/agenda/novo?dia=${hoje}`}
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg active:scale-90 dark:bg-slate-700"
        aria-label="Novo agendamento"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
