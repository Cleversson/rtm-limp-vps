import { getUsuarioAtual } from "@/lib/supabase/auth";
import { BotaoVoltar } from "@/components/botao-voltar";
import { calcularPreco } from "./actions";
import { CalculadoraForm, type ItemPersistido } from "./calculadora-form";

function itensVariaveisFromParam(param: string | undefined): ItemPersistido[] {
  if (!param) return [];
  try {
    const parsed = JSON.parse(param);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (i): i is { nome: unknown; valor: unknown } =>
          i && typeof i === "object",
      )
      .map((i) => ({ nome: String(i.nome ?? ""), valor: Number(i.valor) || 0 }))
      .filter((i) => i.nome.length > 0);
  } catch {
    return [];
  }
}

export default async function PrecificacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; produtos?: string }>;
}) {
  const { error, produtos } = await searchParams;
  const { usuario } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresas) {
    return (
      <div>
        <div className="flex items-center gap-3">
          <BotaoVoltar href="/ajustes" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Calculadora de Precificação
          </h1>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Administradores não têm uma empresa própria para usar a
          calculadora nesta fase.
        </p>
      </div>
    );
  }

  const empresa = usuario.empresas as unknown as {
    custos_fixos_itens: ItemPersistido[] | null;
    horas_produtivas_mes: number | null;
    margem_lucro_padrao: number | null;
    taxa_maquininha_padrao: number | null;
    taxa_pix_padrao: number | null;
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <BotaoVoltar href="/ajustes" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Calculadora de Precificação
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Descubra o preço ideal para um serviço em 4 passos.
      </p>

      <CalculadoraForm
        action={calcularPreco}
        error={error}
        defaultValues={{
          custosFixos: empresa.custos_fixos_itens,
          horas: empresa.horas_produtivas_mes,
          margem: empresa.margem_lucro_padrao,
          taxaMaquininha: empresa.taxa_maquininha_padrao,
          taxaPix: empresa.taxa_pix_padrao,
        }}
        itensVariaveisIniciais={itensVariaveisFromParam(produtos)}
      />
    </div>
  );
}
