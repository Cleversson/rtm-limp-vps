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
    if (!titulo.trim() || !mensagem.trim()) { setErro("Preencha todos os campos."); return; }
    setLoading(true); setErro("");
    const supabase = createClient();
    const { error } = await supabase.from("avisos").insert({ titulo: titulo.trim(), mensagem: mensagem.trim(), ativo: true });
    if (error) { setErro("Erro ao criar aviso: " + error.message); setLoading(false); return; }
    fetch("/api/notificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo: "novo_aviso", dados: { titulo: titulo.trim() } }) }).catch(() => {});
    router.push("/admin/avisos");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/avisos" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">&larr; Avisos</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Novo aviso</h1>
        <p className="text-sm text-emerald-600">Sera enviado para todas as empresas</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
        {erro && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{erro}</p>}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Titulo</label>
          <input
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Nova funcionalidade disponivel"
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mensagem</label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            placeholder="Descreva o aviso para os usuarios"
            rows={5}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar aviso"}
          </button>
          <Link href="/admin/avisos" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}