import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_CHECK_TIMEOUT_MS = 6000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  function getUserComTimeout(ms: number) {
    return new Promise<{
      user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
      timedOut: boolean;
    }>((resolve) => {
      const timer = setTimeout(() => resolve({ user: null, timedOut: true }), ms);
      supabase.auth
        .getUser()
        .then(({ data }) => {
          clearTimeout(timer);
          resolve({ user: data.user, timedOut: false });
        })
        .catch(() => {
          clearTimeout(timer);
          resolve({ user: null, timedOut: true });
        });
    });
  }

  const { user, timedOut } = await getUserComTimeout(AUTH_CHECK_TIMEOUT_MS);

  const protectedPrefixes = [
    "/app",
    "/configuracoes",
    "/servicos",
    "/clientes",
    "/ajustes",
    "/agenda",
    "/financeiro",
    "/precificacao",
    "/orcamentos",
    "/produtos",
    "/mensagens",
    "/assinaturas",
    "/admin",
  ];
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (timedOut) {
      url.searchParams.set(
        "error",
        "Não conseguimos verificar sua sessão a tempo (conexão lenta com o servidor). Tente novamente.",
      );
    }
    return NextResponse.redirect(url);
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
