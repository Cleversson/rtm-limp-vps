import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ativo: false, autenticado: false }, { headers: { "Cache-Control": "no-store" } });
  const service = createServiceClient();
  const { data, error } = await service.from("usuarios").select("ativo").eq("id", user.id).maybeSingle();
  console.log("[api/me] user:", user.id, "data:", data, "error:", error);
  if (!data) return NextResponse.json({ ativo: false, autenticado: true }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.json({ ativo: data.ativo, autenticado: true }, { headers: { "Cache-Control": "no-store" } });
}