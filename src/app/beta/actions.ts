"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BETA_COOKIE_NOME, hashSenhaBeta } from "@/lib/beta-gate";

export async function verificarSenhaBeta(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");
  const next = String(formData.get("next") ?? "/login");
  const senhaBeta = process.env.BETA_ACCESS_PASSWORD;

  if (!senhaBeta || senha !== senhaBeta) {
    redirect(
      `/beta?error=${encodeURIComponent("Senha incorreta.")}&next=${encodeURIComponent(next)}`,
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(BETA_COOKIE_NOME, await hashSenhaBeta(senhaBeta), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect(next);
}
