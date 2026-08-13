"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notificarNovoUsuario } from "@/lib/telegram";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.",
      )}`,
    );
  }

  notificarNovoUsuario(email, "nova conta").catch(() => {});
  redirect("/app");
}

export async function signInWithGoogle() {
  const headersList = await headers();
  const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(
        error?.message ?? "Não foi possível iniciar o login com Google.",
      )}`,
    );
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
