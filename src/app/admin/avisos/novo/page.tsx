"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoAvisoPage() {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      setErro("Preencha título e mensagem.");
      return;
    }
    setLoading(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.from("avisos").insert({
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      ativo: true,
      empresa_id: null,
    });
    setLoading(false);
    if (error) {
      setErro("Erro ao criar aviso: " + error.message);
      return;
    }
    fetch("/api/notificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "novo_aviso", dados: { titulo: titulo.trim() } }) }).catch(() => {});
    router.push("/admin/avisos");
    router.refresh();
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/avisos" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>← Avisos</Link>
        <h1 style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)", marginTop: "0.5rem" }}>Novo aviso</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Será enviado para todas as empresas</p>
      </div>

      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px", padding: "1.5rem", maxWidth: "600px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Nova funcionalidade disponível"
              style={{ width: "100%", padding: "8px 12px", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", fontSize: "14px", background: "var(--surface-1)", color: "var(--text-primary)" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>Mensagem</label>
            <textarea
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              placeholder="Descreva o aviso para os usuários..."
              rows={4}
              style={{ width: "100%", padding: "8px 12px", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", fontSize: "14px", background: "var(--surface-1)", color: "var(--text-primary)", resize: "vertical" }}
            />
          </div>

          {erro && (
            <div style={{ padding: "8px 12px", background: "var(--bg-danger)", color: "var(--text-danger)", borderRadius: "var(--radius)", fontSize: "13px", marginBottom: "1rem" }}>
              {erro}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "8px 20px", background: "#10B981", color: "#fff", border: "none", borderRadius: "var(--radius)", fontSize: "14px", fontWeight: 500, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Criando..." : "Criar aviso"}
            </button>
            <Link href="/admin/avisos" style={{ padding: "8px 20px", border: "0.5px solid var(--border-strong)", borderRadius: "var(--radius)", fontSize: "14px", color: "var(--text-secondary)", textDecoration: "none" }}>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
