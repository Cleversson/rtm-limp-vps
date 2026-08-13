import Link from "next/link";
import {
  Calculator,
  ChevronRight,
  Download,
  FlaskConical,
  LogOut,
  MessageSquareText,
  Settings,
  Signature,
  Wrench,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { InstallAppButton } from "@/components/install-app-button";
import { ThemeToggleItem } from "@/components/theme-toggle-item";

const items = [
  {
    href: "/servicos",
    label: "Serviços",
    description: "Catálogo de serviços e preços",
    icon: Wrench,
  },
  {
    href: "/produtos",
    label: "Custo de Produtos",
    description: "Calcule o gasto de produtos por atendimento",
    icon: FlaskConical,
  },
  {
    href: "/precificacao",
    label: "Precificação",
    description: "Calculadora de preço ideal",
    icon: Calculator,
  },
  {
    href: "/mensagens",
    label: "Mensagens",
    description: "Textos padrão de WhatsApp (orçamento, recibo, lembrete)",
    icon: MessageSquareText,
  },
  {
    href: "/assinaturas",
    label: "Assinaturas",
    description: "Imagens de assinatura para usar no Recibo",
    icon: Signature,
  },
  {
    href: "/configuracoes",
    label: "Configurações da empresa",
    description: "Dados cadastrais e logo",
    icon: Settings,
  },
];

export default function AjustesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Gestão
      </h1>

      <div className="mt-6 flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </Link>
        ))}
        <ThemeToggleItem />
      </div>

      <InstallAppButton />

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Exportar dados
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Baixe um backup dos dados da empresa
          </span>
        </div>
        <div className="flex shrink-0 gap-2">
          <a
            href="/api/exportar-dados"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            JSON
          </a>
          <a
            href="/api/exportar-dados/xlsx"
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Excel
          </a>
        </div>
      </div>

      <form action={signOut} className="mt-6">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </form>
    </div>
  );
}
