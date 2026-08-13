"use client";

import { useRef, useState } from "react";
import { buscarEnderecoPorCep } from "@/lib/cep";

export type ClienteFormValues = {
  nome?: string;
  telefone?: string;
  email?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  observacoes?: string | null;
  recorrencia_meses?: number | string | null;
};

const inputClass =
  "rounded border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 ${className ?? ""}`}
    >
      {label}
      {children}
    </label>
  );
}

function formatarCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function ClienteForm({
  action,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: ClienteFormValues;
  error?: string;
  submitLabel: string;
}) {
  const [endereco, setEndereco] = useState(defaultValues?.endereco ?? "");
  const [numero, setNumero] = useState(defaultValues?.numero ?? "");
  const [complemento, setComplemento] = useState(
    defaultValues?.complemento ?? "",
  );
  const [bairro, setBairro] = useState(defaultValues?.bairro ?? "");
  const [cidade, setCidade] = useState(defaultValues?.cidade ?? "");
  const [estado, setEstado] = useState(defaultValues?.estado ?? "");
  const [cep, setCep] = useState(formatarCep(defaultValues?.cep ?? ""));
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepErro, setCepErro] = useState<string | null>(null);
  const ultimoCepPedido = useRef<string | null>(null);

  async function handleCepChange(value: string) {
    const formatted = formatarCep(value);
    setCep(formatted);
    setCepErro(null);

    const digits = formatted.replace(/\D/g, "");
    if (digits.length !== 8) return;

    ultimoCepPedido.current = digits;
    setBuscandoCep(true);

    const resultado = await buscarEnderecoPorCep(digits);

    if (ultimoCepPedido.current !== digits) return; // resposta atrasada, CEP já mudou
    setBuscandoCep(false);

    if (resultado) {
      setEndereco(resultado.logradouro);
      setBairro(resultado.bairro);
      setCidade(resultado.localidade);
      setEstado(resultado.uf);
    } else {
      setCepErro(
        "Não foi possível preencher automaticamente. Confira o CEP ou preencha o endereço manualmente.",
      );
    }
  }

  return (
    <form
      action={action}
      className="mt-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <Field label="Nome">
        <input
          name="nome"
          defaultValue={defaultValues?.nome ?? ""}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Telefone (WhatsApp)">
        <input
          name="telefone"
          defaultValue={defaultValues?.telefone ?? ""}
          required
          placeholder="(11) 98765-4321"
          className={inputClass}
        />
      </Field>
      <Field label="E-mail">
        <input
          name="email"
          type="email"
          defaultValue={defaultValues?.email ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Endereço" className="col-span-2">
          <input
            name="endereco"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Número">
          <input
            name="numero"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Complemento (opcional)">
        <input
          name="complemento"
          placeholder="Ex: Apto 302, Bloco B"
          value={complemento}
          onChange={(e) => setComplemento(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bairro">
          <input
            name="bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="CEP">
          <input
            name="cep"
            value={cep}
            onChange={(e) => handleCepChange(e.target.value)}
            placeholder="00000-000"
            className={inputClass}
          />
          {buscandoCep && (
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Buscando endereço...
            </span>
          )}
          {cepErro && (
            <span className="text-xs font-normal text-red-600 dark:text-red-400">
              {cepErro}
            </span>
          )}
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cidade" className="col-span-2">
          <input
            name="cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="UF">
          <input
            name="estado"
            maxLength={2}
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            className={`${inputClass} uppercase`}
          />
        </Field>
      </div>

      <Field label="Observações">
        <textarea
          name="observacoes"
          rows={3}
          defaultValue={defaultValues?.observacoes ?? ""}
          className={inputClass}
        />
      </Field>

      <Field label="Intervalo de recorrência (meses)">
        <input
          name="recorrencia_meses"
          type="number"
          min={1}
          defaultValue={defaultValues?.recorrencia_meses ?? 6}
          className={inputClass}
        />
        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
          Normalmente de 6 a 12 meses, conforme o caso.
        </span>
      </Field>

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
