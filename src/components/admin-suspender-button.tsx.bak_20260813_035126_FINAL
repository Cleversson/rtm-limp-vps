"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SuspenderButton({ empresaId, ativo, empresaNome, empresaEmail }: { empresaId: string; ativo: boolean; empresaNome?: string; empresaEmail?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    const acao = ativo ? "suspender" : "reativar";
    if (!confirm()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("empresas").update({ ativo: !ativo }).eq("id", empresaId);
    fetch("/api/notificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: ativo ? "empresa_suspensa" : "empresa_reativada",
        dados: { nome: empresaNome ?? empresaId, email: empresaEmail ?? "" }
      })
    }).catch(() => {});
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={"rounded-lg px-4 py-2 text-sm font-semibold border transition-colors " + (ativo ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400")}
    >
      {loading ? "Aguarde..." : ativo ? "Suspender empresa" : "Reativar empresa"}
    </button>
  );
}
