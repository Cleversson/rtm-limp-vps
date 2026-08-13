import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkBetaAccess } from "@/lib/beta-gate";

export async function middleware(request: NextRequest) {
  const betaRedirect = await checkBetaAccess(request);
  if (betaRedirect) return betaRedirect;

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
