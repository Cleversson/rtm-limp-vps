import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SuspenderButton from "@/components/admin-suspender-button";

export default async function EmpresaDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [empresa, clientes, agendamentos, orcamentos, transacoes, usuarios] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", id).single(),
    supabase.from("clientes").select("id, nome, created_at").eq("empresa_id", id).order("created_at", { ascending: false }),
    supabase.from("agendamentos").select("id, created_at, status").eq("empresa_id", id).order("created_at", { ascending: false }),
    supabase.from("orcamentos").select("id, created_at, status, total").eq("empresa_id", id).order("created_at", { ascending: false }),
    supabase.from("transacoes").select("id, created_at, tipo, valor, descricao").eq("empresa_id", id).order("created_at", { ascending: false }),
    supabase.from("usuarios").select("id, role").eq("empresa_id", id),
  ]);

  if (!empresa.data) redirect("/admin/empresas");
  const e = empresa.data;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin/empresas" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>← Empresas</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)" }}>{e.nome || "Sem nome"}</h1>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{e.contato_email}</p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", fontWeight: 500, background: e.ativo !== false ? "var(--bg-success)" : "var(--bg-danger)", color: e.ativo !== false ? "var(--text-success)" : "var(--text-danger)" }}>
              {e.ativo !== false ? "Ativo" : "Suspenso"}
            </span>
            <SuspenderButton empresaId={e.id} ativo={e.ativo !== false} empresaNome={e.nome} empresaEmail={e.contato_email} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "1.5rem" }}>
        {[
          { label: "Clientes", value: clientes.data?.length || 0 },
          { label: "Agendamentos", value: agendamentos.data?.length || 0 },
          { label: "Orçamentos", value: orcamentos.data?.length || 0 },
          { label: "Transações", value: transacoes.data?.length || 0 },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: "1rem" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>{k.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 500, color: "var(--text-primary)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>Informações</h2>
          </div>
          <div style={{ padding: "1rem 1.25rem" }}>
            {[
              { label: "WhatsApp", value: e.contato_whatsapp || "—" },
              { label: "Endereço", value: e.contato_endereco || "—" },
              { label: "Cidade", value: e.contato_cidade || "—" },
              { label: "Usuários", value: `${usuarios.data?.length || 0} cadastrados` },
              { label: "Criada em", value: new Date(e.created_at).toLocaleDateString("pt-BR") },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>Últimos clientes</h2>
          </div>
          <div style={{ padding: "0" }}>
            {(clientes.data || []).slice(0, 5).map(c => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{c.nome}</span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            ))}
            {(clientes.data || []).length === 0 && (
              <div style={{ padding: "1rem 1.25rem", fontSize: "13px", color: "var(--text-muted)" }}>Nenhum cliente cadastrado.</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>Últimas transações</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              {["Descrição", "Tipo", "Valor", "Data"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", borderBottom: "0.5px solid var(--border)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(transacoes.data || []).slice(0, 10).map(t => (
              <tr key={t.id}>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", color: "var(--text-primary)" }}>{t.descricao || "—"}</td>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)" }}>
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "8px", fontWeight: 500, background: t.tipo === "entrada" ? "var(--bg-success)" : "var(--bg-danger)", color: t.tipo === "entrada" ? "var(--text-success)" : "var(--text-danger)" }}>
                    {t.tipo}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", fontWeight: 500, color: "var(--text-primary)" }}>
                  R$ {Number(t.valor).toFixed(2)}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  {new Date(t.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {(transacoes.data || []).length === 0 && (
              <tr><td colSpan={4} style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>Nenhuma transação registrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
