import "server-only";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API = () => `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

export async function enviarTelegram(mensagem: string): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) return;
  try {
    await fetch(API(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: mensagem, parse_mode: "HTML" }),
    });
  } catch (err) {
    console.error("[Telegram] Erro:", err);
  }
}

function hora() {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export function notificarNovaEmpresa(nome: string, email: string) {
  return enviarTelegram(`🏢 <b>Nova empresa cadastrada</b>
Nome: ${nome}
Email: ${email}
Hora: ${hora()}`);
}

export function notificarNovoUsuario(email: string, empresa: string) {
  return enviarTelegram(`👤 <b>Novo usuario cadastrado</b>
Email: ${email}
Empresa: ${empresa}
Hora: ${hora()}`);
}

export function notificarLoginAdmin(email: string) {
  return enviarTelegram(`🔐 <b>Login no painel admin</b>
Admin: ${email}
Hora: ${hora()}`);
}

export function notificarEmpresaSuspensa(nome: string, email: string) {
  return enviarTelegram(`🚫 <b>Empresa suspensa</b>
Nome: ${nome}
Email: ${email}
Hora: ${hora()}`);
}

export function notificarEmpresaReativada(nome: string, email: string) {
  return enviarTelegram(`✅ <b>Empresa reativada</b>
Nome: ${nome}
Email: ${email}
Hora: ${hora()}`);
}

export function notificarNovoAviso(titulo: string, adminEmail: string) {
  return enviarTelegram(`📢 <b>Novo aviso criado</b>
Titulo: ${titulo}
Por: ${adminEmail}
Hora: ${hora()}`);
}

export function notificarErroCritico(contexto: string, erro: string) {
  return enviarTelegram(`🔴 <b>Erro critico no sistema</b>
Contexto: ${contexto}
Erro: ${erro.slice(0, 200)}
Hora: ${hora()}`);
}
