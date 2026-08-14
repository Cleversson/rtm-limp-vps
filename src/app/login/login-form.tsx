"use client";
import { GoogleLoginButton } from "@/components/google-login-button";
import { useState } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import logoCompleto from "@/assets/logo-completo.png";

const inputClass = "h-12 w-full rounded-lg border border-slate-200 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20";

export function LoginForm({ error, message }: { error?: string; message?: string }) {
  const [entrando, setEntrando] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState(error || "");
  const [msg, setMsg] = useState(message || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const supabase = createClient();
    if (entrando) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setErro(error.message); setLoading(false); return; }
      const ADMIN_EMAIL = "cleverssondantas@gmail.com";
      window.location.href = email === ADMIN_EMAIL ? "/admin" : "/app";
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setErro(error.message); setLoading(false); return; }
      if (!data.session) {
        setMsg("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        setLoading(false);
        return;
      }
      window.location.href = "/app";
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button onClick={() => setEntrando(true)} className={"flex-1 rounded-lg py-2 text-sm font-semibold transition-colors " + (entrando ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100" : "text-slate-500")}>Entrar</button>
        <button onClick={() => setEntrando(false)} className={"flex-1 rounded-lg py-2 text-sm font-semibold transition-colors " + (!entrando ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100" : "text-slate-500")}>Criar conta</button>
      </div>

      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{entrando ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
      <p className="mt-1 text-sm text-slate-500">{entrando ? "Acesse sua conta para gerenciar seus servicos." : "Comece seus 7 dias gratuitos agora."}</p>

      {erro && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{erro}</div>}
      {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{msg}</div>}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
        </div>
        <button type="submit" disabled={loading} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-70">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{entrando ? "Entrar" : "Criar conta"}<ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400 dark:bg-slate-900">ou</span></div>
      </div>

      <GoogleLoginButton />
    </div>
  );
}