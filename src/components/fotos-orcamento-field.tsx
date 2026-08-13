"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { comprimirImagem } from "@/lib/image";
import { MAX_FOTOS_ORCAMENTO } from "@/lib/orcamento";

export function FotosOrcamentoField({
  name = "fotos",
  max = MAX_FOTOS_ORCAMENTO,
}: {
  name?: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processando, setProcessando] = useState(false);

  function sincronizarInput(novasFotos: File[]) {
    const dataTransfer = new DataTransfer();
    novasFotos.forEach((f) => dataTransfer.items.add(f));
    if (inputRef.current) {
      inputRef.current.files = dataTransfer.files;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;

    const disponiveis = max - fotos.length;
    const aAdicionar = arquivos.slice(0, disponiveis);

    setProcessando(true);
    try {
      const comprimidas = await Promise.all(
        aAdicionar.map((file) => comprimirImagem(file)),
      );
      const novasFotos = [...fotos, ...comprimidas];
      setFotos(novasFotos);
      setPreviews(novasFotos.map((f) => URL.createObjectURL(f)));
      sincronizarInput(novasFotos);
    } finally {
      setProcessando(false);
    }
  }

  function removerFoto(index: number) {
    const novasFotos = fotos.filter((_, i) => i !== index);
    setFotos(novasFotos);
    setPreviews(novasFotos.map((f) => URL.createObjectURL(f)));
    sincronizarInput(novasFotos);
  }

  const atingiuLimite = fotos.length >= max;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Fotos (opcional)
      </span>

      {previews.length > 0 && (
        <div className="grid min-w-0 grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Foto ${i + 1}`}
                className="h-full w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
              />
              <button
                type="button"
                onClick={() => removerFoto(i)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow"
                aria-label={`Remover foto ${i + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* O <input> fica sempre montado — ele carrega o FileList real que vai
          no submit. Desmontá-lo quando atinge o limite (como fazia antes,
          aninhado dentro do <label> condicional) apaga o que já foi
          sincronizado nele via DataTransfer; só o botão visível soma/some. */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {!atingiuLimite && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600"
        >
          <ImagePlus className="h-5 w-5" />
          {processando ? "Preparando fotos..." : "Adicionar fotos"}
        </button>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        {fotos.length > 0
          ? `${fotos.length}/${max} fotos adicionadas.`
          : `Limite máximo de ${max} fotos.`}
      </p>
    </div>
  );
}
