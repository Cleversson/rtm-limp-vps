import { createClient } from "@/lib/supabase/server";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, role, empresa_id, empresas(nome, contato_email)")
    .order("role");

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)" }}>Usuários</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>{usuarios?.length || 0} usuários cadastrados</p>
      </div>
      <div style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr>
              {["ID", "Papel", "Empresa"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "0.5px solid var(--border)", fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(usuarios || []).map(u => (
              <tr key={u.id}>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>{u.id.slice(0, 8)}...</td>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)" }}>
                  <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "10px", fontWeight: 500, background: u.role === "admin" ? "var(--bg-accent)" : "var(--surface-1)", color: u.role === "admin" ? "var(--text-accent)" : "var(--text-secondary)", border: u.role !== "admin" ? "0.5px solid var(--border)" : "none" }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: "0.5px solid var(--border)", color: "var(--text-primary)" }}>
                  {(u as any).empresas?.nome || <span style={{ color: "var(--text-muted)" }}>Sem empresa</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
