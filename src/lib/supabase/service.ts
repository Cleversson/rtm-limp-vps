import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Bypassa RLS via service role key. Uso restrito às rotas públicas de PDF
 * (`/api/orcamentos/[id]/pdf`, `/api/recibos/[transacaoId]/pdf`), que servem
 * um visitante não autenticado (quem recebe o link pelo WhatsApp) — nunca
 * importar em código que roda no browser ou em páginas protegidas.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
