"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

// Mesmo padrão já usado em install-app-button.tsx: o servidor não tem como
// saber o tema resolvido (depende de localStorage/SO, só existe no
// navegador), então o snapshot do servidor é sempre "não montado" e o do
// cliente é sempre "montado" — useSyncExternalStore troca de um pro outro
// sem disparar o warning de mismatch de hidratação (diferente de um
// useState+useEffect fazendo a mesma coisa manualmente).
function inscrever() {
  return () => {};
}

function estaMontado() {
  return true;
}

export function ThemeToggleItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const montado = useSyncExternalStore(inscrever, estaMontado, () => false);

  const escuro = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(escuro ? "light" : "dark")}
      className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 text-left last:border-b-0 hover:bg-slate-50"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-5 w-5 items-center justify-center text-slate-500">
          {montado &&
            (escuro ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900">
            Aparência
          </span>
          <span className="text-xs text-slate-500">Tema claro ou escuro</span>
        </div>
      </div>
    </button>
  );
}
