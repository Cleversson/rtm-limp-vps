"use client";

import { useMemo, useState } from "react";

export type ClienteResumo = {
  id: string;
  nome: string;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
};

export type ServicoResumo = {
  id: string;
  nome: string;
  duracao_minutos: number | null;
};

export type AgendamentoFormValues = {
  cliente_id?: string;
  servico_id?: string | null;
  data?: string;
  hora_inicio?: string;
  hora_fim?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  status?: string;
  observacoes?: string | null;
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

function somaMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = h * 60 + m + minutos;
  const hh = Math.floor((((total % (24 * 60)) + 24 * 60) % (24 * 60)) / 60);
  const mm = ((total % 60) + 60) % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function AgendamentoForm({
  action,
  clientes,
  servicos,
  defaultValues,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  clientes: ClienteResumo[];
  servicos: ServicoResumo[];
  defaultValues?: AgendamentoFormValues;
  error?: string;
  submitLabel: string;
}) {
  const [clienteId, setClienteId] = useState(defaultValues?.cliente_id ?? "");
  const [servicoId, setServicoId] = useState(defaultValues?.servico_id ?? "");
  const [horaInicio, setHoraInicio] = useState(
    defaultValues?.hora_inicio ?? "",
  );
  const [horaFim, setHoraFim] = useState(defaultValues?.hora_fim ?? "");
  const [endereco, setEndereco] = useState(defaultValues?.endereco ?? "");
  const [numero, setNumero] = useState(defaultValues?.numero ?? "");
  const [complemento, setComplemento] = useState(
    defaultValues?.complemento ?? "",
  );
  const [bairro, setBairro] = useState(defaultValues?.bairro ?? "");
  const [cidade, setCidade] = useState(defaultValues?.cidade ?? "");
  const [estado, setEstado] = useState(defaultValues?.estado ?? "");
  const [cep, setCep] = useState(defaultValues?.cep ?? "");

  const clientesById = useMemo(
    () => Object.fromEntries(clientes.map((c) => [c.id, c])),
    [clientes],
  );
  const servicosById = useMemo(
    () => Object.fromEntries(servicos.map((s) => [s.id, s])),
    [servicos],
  );

  function handleClienteChange(id: string) {
    setClienteId(id);
    const cliente = clientesById[id];
    if (cliente) {
      setEndereco(cliente.endereco ?? "");
      setNumero(cliente.numero ?? "");
      setComplemento(cliente.complemento ?? "");
      setBairro(cliente.bairro ?? "");
      setCidade(cliente.cidade ?? "");
      setEstado(cliente.estado ?? "");
      setCep(cliente.cep ?? "");
    }
  }

  function recalcularHoraFim(inicio: string, servId: string) {
    const servico = servicosById[servId];
    if (servico?.duracao_minutos && inicio) {
      setHoraFim(somaMinutos(inicio, servico.duracao_minutos));
    }
  }

  function handleServicoChange(id: string) {
    setServicoId(id);
    recalcularHoraFim(horaInicio, id);
  }

  function handleHoraInicioChange(value: string) {
    setHoraInicio(value);
    recalcularHoraFim(value, servicoId);
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

      <Field label="Cliente">
        <select
          name="cliente_id"
          required
          value={clienteId}
          onChange={(e) => handleClienteChange(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Selecione um cliente
          </option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Serviço (opcional)">
        <select
          name="servico_id"
          value={servicoId}
          onChange={(e) => handleServicoChange(e.target.value)}
          className={inputClass}
        >
          <option value="">Nenhum</option>
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <input
            type="date"
            name="data"
            required
            defaultValue={defaultValues?.data ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "agendado"}
            className={inputClass}
          >
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Hora início">
          <input
            type="time"
            name="hora_inicio"
            required
            value={horaInicio}
            onChange={(e) => handleHoraInicioChange(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Hora fim">
          <input
            type="time"
            name="hora_fim"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

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
            onChange={(e) => setCep(e.target.value)}
            className={inputClass}
          />
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

      <button
        type="submit"
        className="mt-2 h-12 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        {submitLabel}
      </button>
    </form>
  );
}
