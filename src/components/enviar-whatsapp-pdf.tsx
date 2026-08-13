"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

function ehAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function suportaCompartilharArquivo(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") {
    return false;
  }
  try {
    const arquivoTeste = new File([""], "teste.pdf", { type: "application/pdf" });
    return navigator.canShare({ files: [arquivoTeste] });
  } catch {
    return false;
  }
}

// O suporte a compartilhar arquivo é fixo pro navegador (não muda em runtime),
// então "inscrever" é um no-op — só precisamos do snapshot certo em cada lado
// (servidor sempre `false`, cliente checa de verdade), sem mismatch de hidratação.
function inscrever() {
  return () => {};
}

export function EnviarWhatsappPdf({
  telefone,
  mensagemPadrao,
  pdfUrl,
}: {
  telefone: string;
  mensagemPadrao: string;
  pdfUrl?: string;
}) {
  const [mensagem, setMensagem] = useState(mensagemPadrao);
  const podeCompartilharArquivo = useSyncExternalStore(
    inscrever,
    suportaCompartilharArquivo,
    () => false,
  );
  const [arquivoPreparado, setArquivoPreparado] = useState<File | null>(null);
  const [preparoFalhou, setPreparoFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemCopiada, setMensagemCopiada] = useState(false);

  // No Android, o WhatsApp descarta o texto do compartilhamento quando um
  // arquivo também está presente (limitação documentada do próprio app, não
  // do navigator.share()/Chromium) — copiamos a mensagem pra área de
  // transferência como rede de segurança, e o aviso some sozinho depois de
  // um tempo.
  useEffect(() => {
    if (!mensagemCopiada) return;
    const timer = setTimeout(() => setMensagemCopiada(false), 5000);
    return () => clearTimeout(timer);
  }, [mensagemCopiada]);

  // Pré-busca o PDF assim que o botão pode aparecer, em vez de esperar o
  // clique — navigator.share() só é aceito pelo navegador dentro da janela de
  // "ativação transitória" do gesto do usuário, e qualquer await entre o
  // clique e a chamada consome essa janela. A rota do PDF regenera o arquivo
  // e sobe pro Storage a cada acesso (medido: 2-4s mesmo em condição ideal,
  // mais ainda com cold start/rede real), tempo suficiente pra estourar essa
  // janela em parte das tentativas — era a causa da falha intermitente.
  useEffect(() => {
    if (!pdfUrl || !podeCompartilharArquivo) return;

    let cancelado = false;

    (async () => {
      setArquivoPreparado(null);
      setPreparoFalhou(false);
      try {
        const resposta = await fetch(pdfUrl);
        if (!resposta.ok) {
          throw new Error(`Rota do PDF retornou status ${resposta.status}`);
        }
        const blob = await resposta.blob();
        if (cancelado) return;
        setArquivoPreparado(new File([blob], "documento.pdf", { type: "application/pdf" }));
      } catch (err) {
        if (cancelado) return;
        console.error("[EnviarWhatsappPdf] Falha ao pré-carregar o PDF para compartilhamento:", err);
        setPreparoFalhou(true);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [pdfUrl, podeCompartilharArquivo, tentativa]);

  function handleCompartilhar() {
    if (!arquivoPreparado) return;
    setErro(null);

    // Só no Android: copia a mensagem pro clipboard como rede de segurança
    // (ver comentário acima). Chamada síncrona, sem await — igual ao
    // share() logo abaixo, pra não gastar a ativação transitória do clique.
    if (ehAndroid() && typeof navigator.clipboard?.writeText === "function") {
      navigator.clipboard.writeText(mensagem).then(
        () => setMensagemCopiada(true),
        (err: unknown) => {
          console.error(
            "[EnviarWhatsappPdf] Falha ao copiar mensagem para a área de transferência:",
            err,
          );
        },
      );
    }

    // Chamada síncrona (sem await antes) — mantém a ativação do clique válida.
    navigator
      .share({ files: [arquivoPreparado], text: mensagem })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") {
          // Usuário fechou a folha de compartilhamento sem escolher nada — não é erro.
          return;
        }
        const nome = err instanceof Error ? err.name : "erro desconhecido";
        console.error("[EnviarWhatsappPdf] navigator.share() falhou:", nome, err);
        setErro(`Não foi possível compartilhar o PDF (${nome}). Tente novamente.`);
      });
  }

  const mostrarCompartilharArquivo =
    Boolean(pdfUrl) && podeCompartilharArquivo && !preparoFalhou;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
        Mensagem do WhatsApp
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={4}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-100 dark:focus:ring-slate-100/20"
        />
      </label>

      {erro && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400">
          {erro}
        </p>
      )}

      {mensagemCopiada && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          Mensagem copiada! Cole no WhatsApp após anexar o arquivo.
        </p>
      )}

      {mostrarCompartilharArquivo ? (
        <button
          type="button"
          onClick={handleCompartilhar}
          disabled={!arquivoPreparado}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          {arquivoPreparado ? "Compartilhar PDF" : "Preparando PDF..."}
        </button>
      ) : (
        <a
          href={`${whatsappLink(telefone)}?text=${encodeURIComponent(mensagem)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar por WhatsApp
        </a>
      )}

      {preparoFalhou && (
        <button
          type="button"
          onClick={() => setTentativa((t) => t + 1)}
          className="text-xs font-medium text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          Não foi possível preparar o PDF para anexar — tentar de novo
        </button>
      )}
    </div>
  );
}
