import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PermissoesClient from "@/components/admin-permissoes-client";

const GRUPOS_PADRAO = ["Operador", "Supervisor", "Gerente", "Diretoria"];

const MENUS = [
  { secao: "Clientes", itens: [
    { rota: "/clientes", label: "Lista de clientes" },
    { rota: "/clientes/novo", label: "Cadastrar cliente" },
  ]},
  { secao: "Agenda", itens: [
    { rota: "/agenda", label: "Agenda" },
    { rota: "/agenda/novo", label: "Novo agendamento" },
  ]},
  { secao: "Financeiro", itens: [
    { rota: "/financeiro", label: "Financeiro" },
    { rota: "/financeiro/novo", label: "Lançar transação" },
  ]},
  { secao: "Orçamentos", itens: [
    { rota: "/orcamentos", label: "Orçamentos" },
    { rota: "/orcamentos/novo", label: "Novo orçamento" },
  ]},
  { secao: "Gestão", itens: [
    { rota: "/servicos", label: "Serviços" },
    { rota: "/produtos", label: "Produtos" },
    { rota: "/precificacao", label: "Precificação" },
    { rota: "/mensagens", label: "Mensagens WhatsApp" },
    { rota: "/assinaturas", label: "Assinaturas" },
    { rota: "/configuracoes", label: "Configurações da empresa" },
  ]},
];

export default async function PermissoesPage() {
  const supabase = await createClient();
  const { data: empresas } = await supabase
    .from("empresas")
    .select("id, nome, contato_email")
    .not("contato_email", "like", "%@example.com%")
    .order("nome");

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-primary)" }}>Permissões por grupo</h1>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Configure quais menus cada grupo pode acessar por empresa</p>
      </div>

      <PermissoesClient empresas={empresas || []} grupos={GRUPOS_PADRAO} menus={MENUS} />
    </div>
  );
}
