import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

export const getUsuarioAtual = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("role, empresa_id, empresas(*)")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar usuario/empresa:", error);
  }

  return { user, usuario, supabase };
});
