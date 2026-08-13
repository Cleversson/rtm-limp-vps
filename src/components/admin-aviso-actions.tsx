"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AvisoActions({ avisoId, ativo }: { avisoId: string; ativo: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleAtivo() {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("avisos").update({ ativo: !ativo }).eq("id", avisoId);
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Excluir este aviso permanentemente?")) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("avisos").delete().eq("id", avisoId);
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button onClick={toggleAtivo} disabled={loading} style={{ fontSize: "12px", padding: "4px 10px", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
        {ativo ? "Desativar" : "Reativar"}
      </button>
      <button onClick={handleDelete} disabled={loading} style={{ fontSize: "12px", padding: "4px 10px", border: "0.5px solid var(--border-danger)", borderRadius: "var(--radius)", background: "transparent", cursor: "pointer", color: "var(--text-danger)" }}>
        Excluir
      </button>
    </div>
  );
}
