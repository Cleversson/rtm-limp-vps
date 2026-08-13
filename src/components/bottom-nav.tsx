"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  activeMatch?: (pathname: string) => boolean;
};

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {items.map((item) => {
        const Icon = item.icon;

        if (!item.href) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              className="flex flex-col items-center justify-center gap-0.5 pt-1 text-slate-300 dark:text-slate-600"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold">{item.label}</span>
            </span>
          );
        }

        const isActive = item.activeMatch?.(pathname) ?? false;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 pt-1 transition-transform active:scale-95 ${
              isActive
                ? "border-t-4 border-emerald-500 font-bold text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-semibold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
