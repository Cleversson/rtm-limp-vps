"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function AcessoBloqueadoGuard() {
  const redirecionando = useRef(false);

  useEffect(() => {
    async function verificar() {
      if (redirecionando.current) return;
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        if (!data.autenticado || data.ativo === false) {
          if (redirecionando.current) return;
          redirecionando.current = true;
          const supabase = createClient();
          await supabase.auth.signOut();
          const msg = encodeURIComponent("Seu acesso foi suspenso. Entre em contato com o administrador.");
          window.location.replace("/login?error=" + msg);
        }
      } catch {}
    }
    verificar();
    const interval = setInterval(verificar, 15000);
    return () => clearInterval(interval);
  }, []);

  return null;
}