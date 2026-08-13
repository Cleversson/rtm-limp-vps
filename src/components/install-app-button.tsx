"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Download, Plus, Share } from "lucide-react";
import { Modal } from "./modal";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Nenhum dos dois muda em runtime (é fixo pro navegador/instalação atual),
// então "inscrever" é um no-op — só precisamos do snapshot certo em cada lado
// (servidor sempre `false`, cliente checa de verdade), sem mismatch de hidratação.
function inscrever() {
  return () => {};
}

function PassoInstrucao({
  numero,
  icon: Icon,
  children,
}: {
  numero: number;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
        {numero}
      </div>
      <div className="flex flex-1 items-center gap-2 pt-0.5">
        <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        <p className="text-sm text-slate-700 dark:text-slate-300">{children}</p>
      </div>
    </div>
  );
}

export function InstallAppButton() {
  const standalone = useSyncExternalStore(inscrever, isStandalone, () => false);
  const ios = useSyncExternalStore(inscrever, isIOS, () => false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  if (standalone) return null;
  if (!deferredPrompt && !ios) return null;

  async function handleClickAndroid() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  }

  return (
    <>
      <div className="mt-6 flex gap-3">
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleClickAndroid}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Instalar no Android
          </button>
        )}

        {ios && (
          <button
            type="button"
            onClick={() => setModalAberto(true)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Share className="h-4 w-4" />
            Instalar no iPhone
          </button>
        )}
      </div>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Instalar no iPhone
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Siga os passos abaixo no Safari.
        </p>
        <div className="mt-4 flex flex-col gap-4">
          <PassoInstrucao numero={1} icon={Share}>
            Toque no ícone de <strong>Compartilhar</strong> na barra do
            Safari.
          </PassoInstrucao>
          <PassoInstrucao numero={2} icon={Plus}>
            Role para baixo e toque em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </PassoInstrucao>
          <PassoInstrucao numero={3} icon={Plus}>
            Toque em <strong>Adicionar</strong> no canto superior direito.
          </PassoInstrucao>
          <PassoInstrucao numero={4} icon={CheckCircle2}>
            Pronto! O ícone do RTM Limp aparece na tela inicial.
          </PassoInstrucao>
        </div>
      </Modal>
    </>
  );
}
