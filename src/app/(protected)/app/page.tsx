import Link from "next/link";
import {
  Banknote,
  CalendarClock,
  ChevronRight,
  MapPin,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { adicionarDias, adicionarMeses, hojeBrasilia } from "@/lib/data-brasil";
import { periodoAnteriorRef, resolverPeriodo, type PeriodoSearchParams } from "@/lib/periodo";
import { PeriodoSeletor } from "@/components/periodo-seletor";
import { whatsappLink } from "@/lib/whatsapp";
import {
  MENSAGENS_PADRAO,
  montarMensagemConfirmacao,
  substituirVariaveis,
} from "@/lib/mensagens";

type Transacao = { tipo: string; valor: number | string };

type AgendamentoProximo = {
  id: string;
  data: string;
  hora_inicio: string;
  status: string;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  clientes: { nome: string; telefone: string } | null;
  servicos: { nome: string } | null;
};

type ClienteRecorrencia = {
  id: string;
  nome: string;
  telefone: string;
  recorrencia_meses: number;
};

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

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataCurta(dataStr: string): string {
  const [, mes, dia] = dataStr.split("-");
  return `${dia}/${mes}`;
}

function rotuloDataRelativa(dataStr: string, hoje: string, amanha: string): string {
  if (dataStr === hoje) return "Hoje";
  if (dataStr === amanha) return "Amanhã";
  return formatarDataCurta(dataStr);
}

function somaPorTipo(transacoes: Transacao[], tipo: string): number {
  return transacoes
    .filter((t) => t.tipo === tipo)
    .reduce((s, t) => s + Number(t.valor), 0);
}

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<PeriodoSearchParams>;
}) {
  const params = await searchParams;
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Início
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para visualizar aqui
          nesta fase.
        </p>
      </div>
    );
  }

  const empresa = usuario.empresas as unknown as {
    nome: string;
    mensagem_lembrete: string | null;
    mensagem_confirmacao: string | null;
  };

  const hoje = hojeBrasilia();
  const amanha = adicionarDias(hoje, 1);

  const periodo = resolverPeriodo(params, hoje);
  // Sem "anterior" bem definido para um intervalo personalizado — a
  // comparação de variação fica desligada nesse caso.
  const periodoAnterior =
    periodo.tipo === "personalizado"
      ? null
      : resolverPeriodo({ periodo: periodo.tipo, ref: periodoAnteriorRef(periodo) }, hoje);

  const [
    resTransacoesMes,
    resTransacoesMesAnterior,
    resTotalClientes,
    resNovosClientes,
    resTotalAgendamentosMes,
    resProximosAgendamentos,
    resTodosClientes,
    resAgendamentosConcluidos,
  ] = await Promise.all([
    supabase
      .from("transacoes")
      .select("tipo, valor")
      .eq("empresa_id", usuario.empresa_id)
      .gte("data", periodo.inicio)
      .lte("data", periodo.fim),
    periodoAnterior
      ? supabase
          .from("transacoes")
          .select("tipo, valor")
          .eq("empresa_id", usuario.empresa_id)
          .gte("data", periodoAnterior.inicio)
          .lte("data", periodoAnterior.fim)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", usuario.empresa_id),
    supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", usuario.empresa_id)
      .gte("created_at", periodo.inicio)
      .lte("created_at", `${periodo.fim}T23:59:59`),
    supabase
      .from("agendamentos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", usuario.empresa_id)
      .gte("data", periodo.inicio)
      .lte("data", periodo.fim),
    supabase
      .from("agendamentos")
      .select(
        "id, data, hora_inicio, status, endereco, numero, complemento, bairro, cidade, estado, clientes(nome, telefone), servicos(nome)",
      )
      .eq("empresa_id", usuario.empresa_id)
      .gte("data", hoje)
      .order("data")
      .order("hora_inicio")
      .limit(5),
    supabase
      .from("clientes")
      .select("id, nome, telefone, recorrencia_meses")
      .eq("empresa_id", usuario.empresa_id),
    supabase
      .from("agendamentos")
      .select("cliente_id, data")
      .eq("empresa_id", usuario.empresa_id)
      .eq("status", "concluido"),
  ]);

  const queriesComNome = [
    ["transacoesMes", resTransacoesMes],
    ["transacoesMesAnterior", resTransacoesMesAnterior],
    ["totalClientes", resTotalClientes],
    ["novosClientes", resNovosClientes],
    ["totalAgendamentosMes", resTotalAgendamentosMes],
    ["proximosAgendamentos", resProximosAgendamentos],
    ["todosClientes", resTodosClientes],
    ["agendamentosConcluidos", resAgendamentosConcluidos],
  ] as const;

  const errosDashboard = queriesComNome
    .filter(([, res]) => res.error)
    .map(([nome, res]) => `${nome}: ${res.error!.message}`);

  if (errosDashboard.length > 0) {
    console.error("Erro ao carregar dados do Dashboard:", errosDashboard);
  }

  const { data: transacoesMes } = resTransacoesMes;
  const { data: transacoesMesAnterior } = resTransacoesMesAnterior;
  const { count: totalClientes } = resTotalClientes;
  const { count: novosClientes } = resNovosClientes;
  const { count: totalAgendamentosMes } = resTotalAgendamentosMes;
  const { data: proximosAgendamentosRaw } = resProximosAgendamentos;
  const { data: todosClientesRaw } = resTodosClientes;
  const { data: agendamentosConcluidosRaw } = resAgendamentosConcluidos;

  const listaMes = (transacoesMes ?? []) as Transacao[];
  const listaMesAnterior = (transacoesMesAnterior ?? []) as Transacao[];

  const faturamentoMes = somaPorTipo(listaMes, "entrada");
  const despesasMes = somaPorTipo(listaMes, "saida");
  const lucroMes = faturamentoMes - despesasMes;
  const margemMes = faturamentoMes > 0 ? (lucroMes / faturamentoMes) * 100 : 0;

  const faturamentoMesAnterior = somaPorTipo(listaMesAnterior, "entrada");
  const variacaoFaturamento =
    faturamentoMesAnterior > 0
      ? ((faturamentoMes - faturamentoMesAnterior) / faturamentoMesAnterior) * 100
      : null;

  const proximosAgendamentos = (
    (proximosAgendamentosRaw ?? []) as unknown as AgendamentoProximo[]
  ).map((ag) => ({
    ...ag,
    linkConfirmacao: ag.clientes?.telefone
      ? `${whatsappLink(ag.clientes.telefone)}?text=${encodeURIComponent(
          montarMensagemConfirmacao({
            template:
              empresa.mensagem_confirmacao || MENSAGENS_PADRAO.confirmacao,
            clienteNome: ag.clientes.nome,
            empresaNome: empresa.nome,
            data: ag.data,
            horaInicio: ag.hora_inicio,
            servicoNome: ag.servicos?.nome ?? null,
            endereco: ag.endereco,
            numero: ag.numero,
            complemento: ag.complemento,
            bairro: ag.bairro,
            cidade: ag.cidade,
          }),
        )}`
      : null,
  }));

  const todosClientes = (todosClientesRaw ?? []) as ClienteRecorrencia[];
  const agendamentosConcluidos = (agendamentosConcluidosRaw ?? []) as {
    cliente_id: string;
    data: string;
  }[];

  const ultimaVisitaPorCliente = new Map<string, string>();
  for (const ag of agendamentosConcluidos) {
    const atual = ultimaVisitaPorCliente.get(ag.cliente_id);
    if (!atual || ag.data > atual) {
      ultimaVisitaPorCliente.set(ag.cliente_id, ag.data);
    }
  }

  const limiteNotificacao = adicionarDias(hoje, 7);

  const notificacoesRecorrencia = todosClientes
    .map((cliente) => {
      const ultimaVisita = ultimaVisitaPorCliente.get(cliente.id);
      if (!ultimaVisita) return null;
      const proximaHigienizacao = adicionarMeses(
        ultimaVisita,
        cliente.recorrencia_meses,
      );
      if (proximaHigienizacao > limiteNotificacao) return null;

      const mensagem = substituirVariaveis(
        empresa.mensagem_lembrete || MENSAGENS_PADRAO.lembrete,
        {
          cliente: cliente.nome,
          empresa: empresa.nome,
          data: new Date(`${ultimaVisita}T00:00:00`).toLocaleDateString("pt-BR"),
        },
      );

      return {
        cliente,
        ultimaVisita,
        proximaHigienizacao,
        atrasado: proximaHigienizacao < hoje,
        linkWhatsapp: `${whatsappLink(cliente.telefone)}?text=${encodeURIComponent(mensagem)}`,
      };
    })
    .filter((n): n is NonNullable<typeof n> => n !== null)
    .sort((a, b) => a.proximaHigienizacao.localeCompare(b.proximaHigienizacao))
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Início
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {empresa.nome}
      </p>

      {errosDashboard.length > 0 && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          <p className="font-medium">
            Alguns dados desta tela não puderam ser carregados:
          </p>
          <ul className="mt-1 list-inside list-disc">
            {errosDashboard.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      {notificacoesRecorrencia.length > 0 && (
        <section className="mt-4 flex flex-col gap-2">
          {notificacoesRecorrencia.map((n) => (
            <div
              key={n.cliente.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    n.atrasado
                      ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}
                >
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {n.cliente.nome}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {n.atrasado ? "Higienização atrasada" : "Higienização chegando"}
                    {" · "}
                    prevista {formatarDataCurta(n.proximaHigienizacao)}
                  </span>
                </div>
              </div>
              <a
                href={n.linkWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400"
                aria-label={`Enviar lembrete para ${n.cliente.nome}`}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          ))}
        </section>
      )}

      <PeriodoSeletor periodo={periodo} basePath="/app" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Faturamento
          </span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(faturamentoMes)}
          </span>
          {variacaoFaturamento !== null && (
            <span
              className={`flex items-center gap-1 text-xs font-medium ${
                variacaoFaturamento >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {variacaoFaturamento >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {variacaoFaturamento >= 0 ? "+" : ""}
              {variacaoFaturamento.toFixed(0)}%
            </span>
          )}
        </div>
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Lucro
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {formatarMoeda(lucroMes)}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Banknote className="h-3 w-3" />
            Margem {margemMes.toFixed(0)}%
          </span>
        </div>
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Clientes
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {totalClientes ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Users className="h-3 w-3" />
            {novosClientes ?? 0} novos no período
          </span>
        </div>
        <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Agendamentos
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {totalAgendamentosMes ?? 0}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CalendarClock className="h-3 w-3" />
            No período
          </span>
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Próximos Agendamentos
          </h2>
          <Link
            href="/agenda"
            className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {proximosAgendamentos.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">
            Nenhum agendamento futuro.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {proximosAgendamentos.map((ag) => (
              <div
                key={ag.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <Link
                  href={`/agenda/${ag.id}/editar`}
                  className="flex min-w-0 flex-1 items-center gap-3 active:scale-[0.98]"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <span className="text-[10px] font-bold uppercase">
                      {rotuloDataRelativa(ag.data, hoje, amanha)}
                    </span>
                    <span className="text-sm font-bold">
                      {ag.hora_inicio.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-bold text-slate-900 dark:text-slate-100">
                      {ag.clientes?.nome ?? "Cliente"}
                    </span>
                    {ag.servicos?.nome && (
                      <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {ag.servicos.nome}
                      </span>
                    )}
                    {(ag.cidade || ag.endereco) && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {[ag.endereco, ag.bairro, ag.cidade]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_CLASSES[ag.status] ?? STATUS_CLASSES.agendado
                    }`}
                  >
                    {STATUS_LABEL[ag.status] ?? ag.status}
                  </span>
                  {ag.linkConfirmacao && (
                    <a
                      href={ag.linkConfirmacao}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400"
                      aria-label={`Confirmar agendamento com ${ag.clientes?.nome ?? "cliente"}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
