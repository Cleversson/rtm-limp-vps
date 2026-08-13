"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { comprimirImagem } from "@/lib/image";

export function ImageUploadField({
  label,
  fieldName,
  imagemUrl,
  ajuda,
  onRemover,
  obrigatorio,
}: {
  label: string;
  fieldName: string;
  imagemUrl: string | null;
  ajuda?: string;
  onRemover?: () => Promise<void>;
  obrigatorio?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    try {
      const comprimida = await comprimirImagem(file);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(comprimida);
      if (inputRef.current) {
        inputRef.current.files = dataTransfer.files;
      }
      setPreview(URL.createObjectURL(comprimida));
    } finally {
      setProcessando(false);
    }
  }

  async function handleRemover() {
    if (!onRemover) return;
    if (!confirm(`Remover ${label.toLowerCase()} atual?`)) return;
    setRemovendo(true);
    try {
      await onRemover();
    } finally {
      setRemovendo(false);
    }
  }

  const imagemAtual = preview ?? imagemUrl;
  const labelMinusculo = label.toLowerCase();

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </span>

      {imagemAtual && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagemAtual}
            alt={label}
            className="h-16 w-16 rounded-md border border-slate-200 object-cover dark:border-slate-800"
          />
          {imagemUrl && !preview && onRemover && (
            <button
              type="button"
              onClick={handleRemover}
              disabled={removendo}
              className="flex items-center gap-1 text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              {removendo ? "Removendo..." : `Remover ${labelMinusculo}`}
            </button>
          )}
        </div>
      )}

      <label className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-600">
        <ImagePlus className="h-5 w-5" />
        {processando
          ? "Preparando imagem..."
          : imagemUrl || preview
            ? `Trocar ${labelMinusculo}`
            : `Adicionar ${labelMinusculo}`}
        <input
          ref={inputRef}
          type="file"
          name={fieldName}
          accept="image/*"
          className="hidden"
          required={obrigatorio}
          onChange={handleFileChange}
        />
      </label>

      {ajuda && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{ajuda}</p>
      )}
    </div>
  );
}
