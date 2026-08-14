"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Calendar, Home, Settings, Users, Wallet } from "lucide-react";
import logoCompleto from "@/assets/logo-completo.png";
import { BottomNav, type NavItem } from "@/components/bottom-nav";

const navItems: NavItem[] = [
  { label: "Início", href: "/app", icon: Home, activeMatch: (p) => p === "/app" },
  {
    label: "Agenda",
    href: "/agenda",
    icon: Calendar,
    activeMatch: (p) => p.startsWith("/agenda"),
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: Users,
    activeMatch: (p) => p.startsWith("/clientes"),
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: Wallet,
    activeMatch: (p) => p.startsWith("/financeiro") || p.startsWith("/orcamentos"),
  },
  {
    label: "Gestão",
    href: "/ajustes",
    icon: Settings,
    activeMatch: (p) =>
      p.startsWith("/ajustes") ||
      p.startsWith("/configuracoes") ||
      p.startsWith("/servicos") ||
      p.startsWith("/precificacao") ||
      p.startsWith("/produtos") ||
      p.startsWith("/mensagens") ||
      p.startsWith("/assinaturas"),
  },
];

function ItemSidebar({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.activeMatch?.(pathname) ?? false;

  return (
    <Link
      href={item.href ?? "#"}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
        isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  );
}

export function ProtectedShell({
  initials,
  children,
  trialBanner,
  trialIcon,
}: {
  initials: string;
  children: React.ReactNode;
  trialBanner?: React.ReactNode;
  trialIcon?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar — desktop */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <Image
            src={logoCompleto}
            alt="RTM Limp"
            className="h-10 w-auto dark:rounded-md dark:bg-white dark:p-1.5"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <ItemSidebar key={item.label} item={item} />
          ))}
        </nav>

        {trialIcon && <div className="px-3 pb-2">{trialIcon}</div>}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            Notificações
          </button>
        </div>
      </aside>

      {/* Header — mobile, inalterado (só ganha classes dark:) */}
      <header className="fixed top-0 z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-700">
            {initials}
          </div>
          <Image
            src={logoCompleto}
            alt="RTM Limp"
            className="h-12 w-auto shrink dark:rounded-md dark:bg-white dark:p-1.5"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="ml-auto">{trialIcon}</div>
      </header>

      <div className="fixed top-16 left-0 right-0 z-30 lg:left-64">{trialBanner}</div>
      <main className="px-5 pb-28 pt-20 lg:ml-64 lg:pb-8 lg:pt-8">
        {children}
      </main>

      <div className="lg:hidden">
        <BottomNav items={navItems} />
      </div>
    </div>
  );
}
