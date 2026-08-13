"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Empresa = { id: string; nome: string; contato_email: string };
type Menu = { secao: string; itens: { rota: string; label: string }[] };

export default function PermissoesClient({ empresas, grupos, menus }: { empresas: Empresa[]; grupos: string[]; menus: Menu[] }) {
  const [empresaId, setEmpresaId] = useState(empresas[0]?.id || "");
  const [grupoAtivo, setGrupoAtivo] = useState(grupos[0]);
  const [permissoes, setPermissoes] = useState<Record<string, boolean>>({});
  const [grupoDbId, setGrupoDbId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (!empresaId || !grupoAtivo) return;
    carregarPermissoes();
  }, [empresaId, grupoAtivo]);

  async function carregarPermissoes() {
    const supabase = createClient();
    const { data: grupo } = await supabase
      .from("grupos")
      .select("id")
      .eq("empresa_id", empresaId)
      .eq("nome", grupoAtivo)
      .maybeSingle();

    if (!grupo) {
      setGrupoDbId(null);
      setPermissoes({});
      return;
    }

    setGrupoDbId(grupo.id);
    const { data: perms } = await supabase
      .from("permissoes")
      .select("rota, ativo")
      .eq("grupo_id", grupo.id);

    const map: Record<string, boolean> = {};
    (perms || []).forEach(p => { map[p.rota] = p.ativo; });
    setPermissoes(map);
  }

  async function salvar() {
    setSalvando(true);
    setMensagem("");
    const supabase = createClient();

    let gId = grupoDbId;
    if (!gId) {
      const { data: novoGrupo } = await supabase
        .from("grupos")
        .insert({ empresa_id: empresaId, nome: grupoAtivo })
        .select("id")
        .single();
      gId = novoGrupo?.id || null;
      setGrupoDbId(gId);
    }

    if (!gId) { setSalvando(false); return; }

    const todasRotas = menus.flatMap(m => m.itens.map(i => i.rota));
    const upserts = todasRotas.map(rota => ({
      grupo_id: gId,
      rota,
      label: menus.flatMap(m => m.itens).find(i => i.rota === rota)?.label || rota,
      ativo: permissoes[rota] ?? false,
    }));

    await supabase.from("permissoes").upsert(upserts, { onConflict: "grupo_id,rota" });
    setSalvando(false);
    setMensagem("Permissões salvas!");
    setTimeout(() => setMensagem(""), 3000);
  }

  function toggle(rota: string) {
    setPermissoes(prev => ({ ...prev, [rota]: !prev[rota] }));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select
          value={empresaId}
          onChange={e => setEmpresaId(e.target.value)}
          style={{ padding: "8px 12px", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", fontSize: "13px", background: "var(--surface-2)", color: "var(--text-primary)" }}
        >
          {empresas.map(e => (
            <option key={e.id} value={e.id}>{e.nome || e.contato_email}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {grupos.map(g => (
          <button key={g} onClick={() => setGrupoAtivo(g)} style={{
            padding: "6px 16px", borderRadius: "var(--radius)", fontSize: "13px", cursor: "pointer",
            border: grupoAtivo === g ? "2px solid var(--border-accent)" : "0.5px solid var(--border)",
            background: grupoAtivo === g ? "var(--bg-accent)" : "var(--surface-2)",
            color: grupoAtivo === g ? "var(--text-accent)" : "var(--text-secondary)",
            fontWeight: grupoAtivo === g ? 500 : 400,
          }}>{g}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
        {menus.map(secao => (
          <div key={secao.secao} style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
            <div style={{ padding: "0.75rem 1.25rem", borderBottom: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{secao.secao}</span>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{secao.itens.length} menus</span>
            </div>
            {secao.itens.map(item => (
              <div key={item.rota} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "14px", color: "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.rota}</div>
                </div>
                <button
                  onClick={() => toggle(item.rota)}
                  style={{
                    width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
                    background: permissoes[item.rota] ? "#10B981" : "var(--border-strong)",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    position: "absolute", top: "2px",
                    left: permissoes[item.rota] ? "22px" : "2px",
                    width: "20px", height: "20px", borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    display: "block",
                  }} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={salvar} disabled={salvando} style={{
          padding: "10px 24px", background: "#10B981", color: "#fff",
          border: "none", borderRadius: "var(--radius)", fontSize: "14px",
          fontWeight: 500, cursor: "pointer", opacity: salvando ? 0.7 : 1,
        }}>
          {salvando ? "Salvando..." : "✓ Salvar permissões"}
        </button>
        {mensagem && (
          <span style={{ fontSize: "13px", color: "var(--text-success)" }}>{mensagem}</span>
        )}
      </div>
    </div>
  );
}
