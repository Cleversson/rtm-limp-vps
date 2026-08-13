"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : () => {};

export function CollapsibleCard({
  title,
  subtitle,
  storageKey,
  defaultOpen = true,
  children,
}: {
  title: string;
  subtitle?: string;
  storageKey: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(defaultOpen);

  useIsomorphicLayoutEffect(() => {
    const salvo = localStorage.getItem(storageKey);
    if (salvo !== null) {
      setAberto(salvo === "aberto");
    }
  }, [storageKey]);

  function alternar() {
    const novo = !aberto;
    setAberto(novo);
    localStorage.setItem(storageKey, novo ? "aberto" : "fechado");
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={alternar}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={aberto}
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform dark:text-slate-500 ${
            aberto ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: aberto ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`pt-1 transition-opacity duration-300 ${
              aberto ? "opacity-100" : "opacity-0"
            }`}
          >
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
