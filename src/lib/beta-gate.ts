import { NextResponse, type NextRequest } from "next/server";

export const BETA_COOKIE_NOME = "beta_access";

export async function hashSenhaBeta(senha: string): Promise<string> {
  const dados = new TextEncoder().encode(senha);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Gate temporário de acesso ao beta — bloqueia o app inteiro atrás de uma
 * senha compartilhada (não é o login de usuário). Pra desligar depois,
 * basta remover a env var BETA_ACCESS_PASSWORD, sem mexer em código.
 */
export async function checkBetaAccess(
  request: NextRequest,
): Promise<NextResponse | null> {
  const senhaBeta = process.env.BETA_ACCESS_PASSWORD;

  if (!senhaBeta) return null;

  const { pathname } = request.nextUrl;

  // /beta é a própria tela de senha; /api fica público de propósito
  // (ex: PDFs de orçamento/recibo abertos por clientes finais sem login).
  if (pathname.startsWith("/beta") || pathname.startsWith("/api")) {
    return null;
  }

  const cookie = request.cookies.get(BETA_COOKIE_NOME)?.value;
  const hashEsperado = await hashSenhaBeta(senhaBeta);

  if (cookie === hashEsperado) return null;

  const url = request.nextUrl.clone();
  url.pathname = "/beta";
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
