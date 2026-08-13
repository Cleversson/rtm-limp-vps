# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

RTM Limp is a multi-tenant SaaS for upholstery/mattress cleaning service providers (sofás, colchões, poltronas), sold by subscription. Each subscribing company (`empresa`) has its own isolated data — this is a product for external customers, not an internal tool.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — also runs the TypeScript check
npm run lint     # eslint
```

There is no test suite configured. Always run `npm run lint` and `npm run build` before considering a change done — `build` catches type errors that `lint` alone misses.

Env vars (`.env.local`, gitignored — see `.env.local.example` for the two required keys): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Auth/Postgres/Storage), deployed on Vercel, repo on GitHub. `next.config.ts` has `reactCompiler: true` — the React Compiler ESLint rule will flag mutations during render (e.g. reassigning a closure variable inside `.map()`); write reduce/immutable patterns instead.

## Multi-tenant / auth model

- `empresas` (tenant) and `usuarios` (1:1 with `auth.users`, has `empresa_id` + `role` of `admin` or `cliente`) are the foundation, created in `supabase/migrations/0001_multi_tenant.sql`.
- A `handle_new_user()` trigger on `auth.users` auto-creates an `empresa` + `usuarios` row (role `cliente`) on signup, unless the email is in a hardcoded admin allowlist inside that trigger (role `admin`, no empresa).
- RLS pattern used by every business table: a `security definer` function `public.is_admin()` (avoids RLS recursion) plus a policy shaped like `empresa_id = (select empresa_id from usuarios where id = auth.uid()) or public.is_admin()`. Copy this pattern for any new table — `cliente` sees/edits only their own empresa's rows, `admin` sees everything.
- **Every new table's migration must include explicit `grant ... to authenticated`** alongside the RLS policies — RLS alone does not grant access; without the `grant`, queries fail with "permission denied" even when the policy is correct. The Supabase Table Editor does this automatically; hand-written SQL in the SQL Editor does not. The same applies to any other Postgres role a client might use (e.g. `service_role` for the public PDF routes below) — a role isn't automatically granted access to a new table just because it bypasses RLS.
- **Always destructure and check `error` from every Supabase call — `.select()`, `.insert()`, `storage.list()`, `storage.remove()`, all of it — never just `data`.** Supabase never throws on failure; a blocked call (missing grant, missing RLS policy, bad auth) quietly returns `{ data: null, error: {...} }`. This exact class of bug has hit this codebase twice: the public PDF routes (`src/app/api/orcamentos/[id]/pdf/route.ts`, `.../recibos/[transacaoId]/pdf/route.ts`) returned a generic 404 "não encontrado" for what was actually a permission error, and `removerLogo()` (`src/app/(protected)/configuracoes/actions.ts`) looked like it worked — the UI updated — while the Storage file itself silently failed to delete because of a missing RLS `delete` policy. Read the `error`, log or surface it, before assuming an empty/falsy result means "not found."

## SQL migrations

`supabase/migrations/*.sql`, sequentially numbered (`0001_...` through `0010_...` currently). There is no Supabase CLI/link set up — the user runs each migration manually in the Supabase SQL Editor after a phase is implemented. When altering an enum or a column that already has real/test data, migrate existing rows (best-effort `UPDATE`) rather than silently dropping data.

## Auth/data fetching in Server Components

`src/lib/supabase/auth.ts` exports `getUsuarioAtual()`, wrapped in React's `cache()`. It calls `supabase.auth.getUser()` once and fetches the `usuarios` row (with `empresas(*)` embedded) once per request, no matter how many Server Components call it — `cache()` deduplicates by request. **Every protected `page.tsx` must call this instead of re-implementing `supabase.auth.getUser()` + a `usuarios` query.** This was a real, measured production performance bug (~2.5s per nav caused by 3x redundant `getUser()` + 2x redundant `usuarios` queries across middleware/layout/page) — see `src/app/(protected)/layout.tsx` and any `page.tsx` under `(protected)/` for the call pattern:

```ts
const { user, usuario, supabase } = await getUsuarioAtual();
if (usuario?.role === "admin" || !usuario?.empresa_id) { /* show admin-not-supported message */ }
```

The middleware's own `getUser()` call (`src/lib/supabase/middleware.ts`) is intentionally separate and NOT deduplicated with the above — it's the actual route-protection gate and runs before the React tree, in a different execution context.

`src/lib/supabase/client.ts` (browser) and `server.ts` (Server Components/Route Handlers, cookie-based) are the two Supabase client factories; `middleware.ts` has its own inline client because it needs the request/response cookie adapter.

**`src/middleware.ts` (not `middleware.ts` at the project root) is required** because the app uses `src/app/` — a root-level `middleware.ts` is silently ignored. Next.js 16 also emits a deprecation warning nudging toward renaming this file `proxy.ts`; not yet migrated (the export name required by that convention hasn't been confirmed).

## Route structure

Everything under `src/app/(protected)/` shares `layout.tsx`, which renders `protected-shell.tsx` (Client Component, 5 fixed nav slots — Início/Agenda/Clientes/Financeiro/Ajustes). Below the `lg:` (1024px) breakpoint it's the original mobile chrome — fixed top bar + bottom nav bar, unchanged since Fase 3; at `lg:` and above it swaps to a fixed left sidebar (logo, the same 5 items, a decorative notifications button in a separated footer section — no unread-count badge, since the Avisos feature doesn't exist on `main`). The bottom nav itself is `src/components/bottom-nav.tsx`, a generic `BottomNav({ items })` — reusable by any other shell that needs the same mobile nav (an admin panel, if one is ever merged in, would import it rather than re-implement it). Settings-adjacent screens (Configurações, Serviços, Precificação) are not their own nav slots — they live under `/ajustes` as a small hub list instead, on both mobile and desktop (the sidebar's "Gestão" item links straight to `/ajustes`, not an expanded submenu). `src/lib/supabase/middleware.ts` has a `protectedPrefixes` array that must be kept in sync with any new top-level route added under `(protected)/`.

Each feature folder follows the same shape: `page.tsx` (list, Server Component), `novo/page.tsx` + `[id]/editar/page.tsx` (create/edit, reusing one `*-form.tsx`), `actions.ts` (Server Actions: `requireSupabase()` auth-check helper, mutate, `revalidatePath`, `redirect` — errors are passed back via `?error=` query params, not thrown to a client boundary). Forms are Server Components by default; they only become Client Components (`"use client"`) when a field must react live to another field (e.g. `agenda/agendamento-form.tsx` recalculating end time from duration, `financeiro/transacao-form.tsx` filtering category options by transaction type).

Admin users (`role: "admin"`) have no `empresa_id` and see a generic "not supported for admins yet" message on every business-data screen rather than a cross-tenant view — there is no admin panel yet.

## Client/Server component boundaries

**Never export a plain constant from a `"use client"` file for a Server Component to import.** Next.js routes any import from a `"use client"` module through its client-reference machinery — this works transparently for the component itself (used as JSX, e.g. `<FotosOrcamentoField />`), but a plain value (e.g. `export const MAX_FOTOS_ORCAMENTO = 5`) imported into a Server Component and used in plain JS logic (not JSX) comes through corrupted — a client-reference object instead of the real value — with **no error, no warning, just silently wrong runtime behavior** (e.g. `3 < MAX_FOTOS_ORCAMENTO` evaluating `false`). This hit `src/app/(protected)/orcamentos/[id]/editar/page.tsx` (Server Component) importing `MAX_FOTOS_ORCAMENTO` from `src/components/fotos-orcamento-field.tsx` (`"use client"`). Fix: any constant/type shared between client and server code lives in a plain module with no `"use client"` directive — see `MAX_FOTOS_ORCAMENTO` in `src/lib/orcamento.ts`, imported by both the client field component and the server edit page.

## Date/timezone handling

`src/lib/data-brasil.ts` centralizes date math: `hojeBrasilia()` gets "today" via `Intl.DateTimeFormat` in `America/Sao_Paulo` — **never use a raw `new Date()` for "today"**, since Vercel's serverless functions run in UTC and that would compute the wrong calendar day for Brazilian users. `pad2`, `primeiroEUltimoDia`, `mesAdjacente`, `adicionarMeses` are the shared month-arithmetic helpers (used by Agenda's calendar and Financeiro's month picker) — they do plain year/month/day integer arithmetic via `new Date(y, m, d)` field construction, never `.toISOString()`, to avoid UTC-offset day-shift bugs.

## Design system

"Petroleum Minimalist" (see `design-reference-mobile/` — local only, gitignored, has both Google Stitch HTML/CSS prototypes and a ChatGPT-generated reference sheet; check the matching subfolder before building a new screen). Mobile-first: build and test at phone viewport before desktop. Font is Inter (`next/font/google` in `src/app/layout.tsx`); icons are `lucide-react` (not the prototypes' Material Symbols font, to avoid an external CDN dependency). Tailwind's default `slate-900`/`emerald-500` already match the design system's Petroleum Blue/Emerald Green exactly — no custom color tokens needed.

Two recurring layout bugs to avoid when building new components:
- A CSS-only bar chart (`flex` column + percentage-height bar) needs the outer row to keep `items-stretch` (the default) and the bar's immediate wrapper to use `flex-1` (not `h-full`) — `items-end` on the row plus `h-full` on the bar makes the bar height resolve against an indeterminate parent and renders invisible.
- Don't concatenate a width utility (`flex-1`, `w-28`, ...) onto a shared input class that already bakes in `w-full` — the two width classes conflict unpredictably. Keep a width-less base class and add sizing only at the call site.

For any new chart/stat-tile/dashboard, and for multi-step wizards with a "Next"/"Submit" button in the same JSX slot, screenshot the isolated component (a standalone HTML/React file + Playwright) before wiring it into the app — several real bugs in this codebase (invisible bars, an accidental-submit bug from a button's `type` flipping `button`→`submit` mid-click) were only caught this way; `npm run build`/`lint` do not catch layout or interaction bugs.
