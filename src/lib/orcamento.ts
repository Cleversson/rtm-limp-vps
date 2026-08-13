export type TipoDesconto = "fixo" | "percentual";

export const MAX_FOTOS_ORCAMENTO = 5;

export const STATUS_ORCAMENTO_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "aprovado", label: "Aprovado" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export const STATUS_ORCAMENTO_LABEL: Record<string, string> =
  Object.fromEntries(STATUS_ORCAMENTO_OPTIONS.map((o) => [o.value, o.label]));

export const STATUS_ORCAMENTO_CLASSES: Record<string, string> = {
  pendente:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  aprovado:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  concluido: "bg-slate-900 text-white dark:bg-slate-700",
  cancelado: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function calcularDesconto(
  subtotal: number,
  valor: number,
  tipo: TipoDesconto,
): number {
  if (tipo === "percentual") {
    return subtotal * (valor / 100);
  }
  return valor;
}

export function calcularTotalOrcamento(
  subtotal: number,
  valor: number,
  tipo: TipoDesconto,
): number {
  return Math.max(0, subtotal - calcularDesconto(subtotal, valor, tipo));
}
