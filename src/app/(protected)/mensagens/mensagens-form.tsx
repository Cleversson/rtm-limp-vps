import {
  MENSAGENS_PADRAO,
  TITULO_POR_TIPO,
  VARIAVEIS_POR_TIPO,
  type TipoMensagem,
} from "@/lib/mensagens";
import { salvarMensagens } from "./actions";

const TIPOS: TipoMensagem[] = ["orcamento", "recibo", "lembrete", "confirmacao"];

export type MensagensFormValues = {
  mensagem_orcamento: string | null;
  mensagem_recibo: string | null;
  mensagem_lembrete: string | null;
  mensagem_confirmacao: string | null;
};

function CampoNome(tipo: TipoMensagem): string {
  return `mensagem_${tipo}`;
}

export function MensagensForm({
  defaultValues,
  error,
  message,
}: {
  defaultValues: MensagensFormValues;
  error?: string;
  message?: string;
}) {
  return (
    <form
      action={salvarMensagens}
      className="mt-6 flex flex-col gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          {message}
        </p>
      )}

      {TIPOS.map((tipo) => (
        <div
          key={tipo}
          className="flex flex-col gap-2 border-t border-slate-100 pt-5 first:border-t-0 first:pt-0 dark:border-slate-800"
        >
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {TITULO_POR_TIPO[tipo]}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Variáveis disponíveis:{" "}
            {VARIAVEIS_POR_TIPO[tipo]
              .map((v) => `{${v.chave}} (${v.descricao})`)
              .join(", ")}
          </p>
          <textarea
            name={CampoNome(tipo)}
            defaultValue={
              defaultValues[CampoNome(tipo) as keyof MensagensFormValues] ??
              MENSAGENS_PADRAO[tipo]
            }
            rows={4}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
          />
        </div>
      ))}

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        Salvar mensagens
      </button>
    </form>
  );
}
