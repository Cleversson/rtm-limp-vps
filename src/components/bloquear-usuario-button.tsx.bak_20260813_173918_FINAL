"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldOff, ShieldCheck } from "lucide-react";

export default function BloquearUsuarioButton({ usuarioId, ativo, email }: { usuarioId: string; ativo: boolean; email: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    const acao = ativo ? "bloquear" : "desbloquear";
    if (!window.confirm("Deseja " + acao + " o acesso de " + email + "?")) return;
    setLoading(true);
    await fetch("/api/admin/usuario-ativo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId, ativo: !ativo, email }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className={"flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors " + (ativo ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400")}
    >
      {ativo ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
      {loading ? "Aguarde..." : ativo ? "Bloquear" : "Desbloquear"}
    </button>
  );
}