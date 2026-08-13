import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BotaoVoltar({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Voltar"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      <ArrowLeft className="h-5 w-5" />
    </Link>
  );
}
