"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import {
  signInWithPassword,
  signUpWithPassword,
  signInWithGoogle,
} from "./actions";

const inputClass =
  "h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20";

function BotaoSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export function LoginForm({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const entrando = mode === "entrar";

  return (
    <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1 text-sm font-medium dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setMode("entrar")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            entrando
              ? "bg-slate-900 text-white dark:bg-slate-700"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("criar")}
          className={`flex-1 rounded-md py-1.5 transition-colors ${
            !entrando
              ? "bg-slate-900 text-white dark:bg-slate-700"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Criar conta
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {entrando ? "Bem-vindo de volta" : "Criar conta"}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {entrando
            ? "Acesse sua conta para gerenciar seus serviços."
            : "Cadastre sua empresa em poucos segundos."}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          {message}
        </p>
      )}

      <form
        action={entrando ? signInWithPassword : signUpWithPassword}
        className="flex flex-col gap-3"
      >
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
          E-mail
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
              className={inputClass}
            />
          </div>
        </label>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Senha
            </label>
            {entrando && (
              <a
                href="#"
                className="text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
              >
                Esqueceu a senha?
              </a>
            )}
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              className={inputClass}
            />
          </div>
        </div>

        <BotaoSubmit label={entrando ? "Entrar" : "Criar conta"} />
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        ou
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg height="20" viewBox="0 0 24 24" width="20">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuar com Google
        </button>
      </form>
    </div>
  );
}
