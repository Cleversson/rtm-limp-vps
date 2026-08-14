"use client";
import { GoogleLoginButton } from "@/components/google-login-button";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import {
  signInWithPassword,
  signUpWithPassword,

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

      <GoogleLoginButton />
    </div>
  );
}
