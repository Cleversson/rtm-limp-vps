"use client";
import { useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.replace("/login?error=" + encodeURIComponent("Nao foi possivel autenticar com Google."));
        return;
      }
      const ADMIN_EMAIL = "cleverssondantas@gmail.com";
      router.replace(session.user.email === ADMIN_EMAIL ? "/admin" : "/app");
    }
    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-sm text-slate-500">Autenticando...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-slate-500">Carregando...</p></div>}>
      <CallbackHandler />
    </Suspense>
  );
}