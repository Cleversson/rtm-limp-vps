import { Trash2 } from "lucide-react";
import { BotaoExcluir } from "@/components/botao-excluir";

export type FotoOrcamento = {
  id: string;
  url: string;
};

export function GaleriaFotos({
  fotos,
  actionExcluir,
}: {
  fotos: FotoOrcamento[];
  actionExcluir?: (formData: FormData) => void | Promise<void>;
}) {
  if (fotos.length === 0) return null;

  return (
    <div className="grid min-w-0 grid-cols-3 gap-3">
      {fotos.map((foto, i) => (
        <div key={foto.id} className="relative aspect-square min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={foto.url}
            alt={`Foto ${i + 1}`}
            className="h-full w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
          />
          {actionExcluir && (
            <form action={actionExcluir} className="absolute -right-1.5 -top-1.5">
              <input type="hidden" name="foto_id" value={foto.id} />
              <BotaoExcluir
                mensagemConfirmacao="Excluir esta foto?"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
                aria-label={`Excluir foto ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </BotaoExcluir>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
