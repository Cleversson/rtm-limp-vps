"use client";

import type { ButtonHTMLAttributes } from "react";

export function BotaoExcluir({
  mensagemConfirmacao,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { mensagemConfirmacao: string }) {
  return (
    <button
      type="submit"
      {...props}
      onClick={(e) => {
        if (!confirm(mensagemConfirmacao)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
