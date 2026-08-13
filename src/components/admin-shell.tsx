"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Megaphone, LogOut, CircleUserRound, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import logoCompleto from "@/assets/logo-completo.png";

const navItems = [
  { href: "/admin", label: "Visao Geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/empresas", label: "Empresas", icon: Building2 },
  { href: "/admin/avisos", label: "Avisos", icon: Megaphone },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }
  function inscrever() { return () => {}; }
  function estaMontado() { return true; }
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useSyncExternalStore(() => () => {}, () => true, () => false);
  const escuro = resolvedTheme === "dark";

  function isActive(item: typeof navItems[0]) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800">
          <Image src={logoCompleto} alt="RTM Limp" className="h-10 w-auto dark:rounded-md dark:bg-white dark:p-1" style={{ objectFit: "contain" }} priority />
        </div>
        <div className="ml-auto pr-5 hidden lg:flex">
          <button onClick={() => setTheme(escuro ? "light" : "dark")} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            {montado && (escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}
                className={"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors " + (active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800")}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <Link href="/admin/conta" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
            <CircleUserRound className="h-5 w-5" aria-hidden="true" />
            Conta
          </Link>
        </div>
      </aside>
      <header className="fixed top-0 z-40 flex h-16 w-full items-center border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <Image src={logoCompleto} alt="RTM Limp" className="h-11 w-auto dark:rounded-md dark:bg-white dark:p-1" style={{ objectFit: "contain" }} priority />
        <button onClick={() => setTheme(escuro ? "light" : "dark")} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          {montado && (escuro ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </button>
      </header>
      <main className="px-5 pb-28 pt-20 lg:ml-64 lg:pb-8 lg:pt-8">
        {children}
      </main>
      <div className="lg:hidden">
        <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}
                className={"flex flex-col items-center justify-center gap-0.5 pt-1 transition-transform active:scale-95 " + (active ? "border-t-4 border-emerald-500 font-bold text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex flex-col items-center justify-center gap-0.5 pt-1 text-slate-500 transition-transform active:scale-95 dark:text-slate-400">
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="text-[11px] font-semibold">Sair</span>
          </button>
        </nav>
      </div>
    </div>
  );
}