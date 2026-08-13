import { createClient } from "@/lib/supabase/server";

export default async function MetricasPage() {
  const supabase = await createClient();
  const [empresas, clientes, agendamentos, orcamentos, transacoes, usuarios] = await Promise.all([
    supabase.from("empresas").select("id, nome, contato_email, created_at, ativo"),
    supabase.from("clientes").select("id, empresa_id, created_at"),
    supabase.from("agendamentos").select("id, empresa_id, status, created_at"),
    supabase.from("orcamentos").select("id, empresa_id, status, total, created_at"),
    supabase.from("transacoes").select("id, empresa_id, tipo, valor, created_at"),
    supabase.from("usuarios").select("id, role"),
  ]);

  const reais = (empresas.data || []).filter(e => !e.contato_email?.includes("@example.com"));
  const ativas = reais.filter(e => e.ativo !== false);
  const totalEntradas = (transacoes.data || []).filter(t => t.tipo === "entrada").reduce((sum, t) => sum + Number(t.valor), 0);
  const totalSaidas = (transacoes.data || []).filter(t => t.tipo === "saida").reduce((sum, t) => sum + Number(t.valor), 0);
  const agConcluidos = (agendamentos.data || []).filter(a => a.status === "concluido").length;
  const orcAprovados = (orcamentos.data || []).filter(o => o.status === "aprovado" || o.status === "concluido").length;

  const metricas = [
    { secao: "Empresas", itens: [
      { label: "Total de empresas reais", valor: reais.length },
      { label: "Empresas ativas", valor: ativas.length },
      { label: "Empresas suspensas", valor: reais.filter(e => e.ativo === false).length },
      { label: "Empresas de teste", valor: (empresas.data || []).filter(e => e.contato_email?.includes("@example.com")).length },
    ]},
    { secao: "Usuários", itens: [
      { label: "Total de usuários", valor: (usuarios.data || []).length },
      { label: "Admins", valor: (usuarios.data || []).filter(u => u.role === "admin").length },
      { label: "Clientes", valor: (usuarios.data || []).filter(u => u.role === "cliente").length },
    ]},
    { secao: "Operação", itens: [
      { label: "Total de clientes cadastrados", valor: (clientes.data || []).length },
      { label: "Total de agendamentos", valor: (agendamentos.data || []).length },
      { label: "Agendamentos concluídos", valor: agConcluidos },
      { label: "Total de orçamentos", valor: (orcamentos.data || []).length },
      { label: "Orçamentos aprovados/concluídos", valor: orcAprovados },
    ]},
    { secao: "Financeiro", itens: [
      { label: "Total de transações", valor: (transacoes.data || []).length },
      { label: "Total de entradas", valor: `R$ ${totalEntradas.toFixed(2)}` },
      { label: "Total de saídas", valor: `R$ ${totalSaidas.toFixed(2)}` },
      { label: "Resultado líquido", valor: `R$ ${(totalEntradas - totalSaidas).toFixed(2)}` },
    ]},
  ];

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)" }}>Métricas</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Dados consolidados de toda a plataforma</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {metricas.map(secao => (
          <div key={secao.secao} style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "0.5px solid var(--border)" }}>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-primary)" }}>{secao.secao}</h2>
            </div>
            <div style={{ padding: "0.5rem 1.25rem" }}>
              {secao.itens.map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
