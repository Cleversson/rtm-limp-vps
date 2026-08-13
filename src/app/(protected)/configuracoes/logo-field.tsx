"use client";

import { ImageUploadField } from "@/components/image-upload-field";
import { removerLogo } from "./actions";

export function LogoField({ logoUrl }: { logoUrl: string | null }) {
  return (
    <ImageUploadField
      label="Logo"
      fieldName="logo"
      imagemUrl={logoUrl}
      onRemover={removerLogo}
      ajuda="Tamanho máximo 2MB (a imagem é comprimida automaticamente). Formato ideal: PNG ou JPEG. Aparece na barra superior do app e no cabeçalho dos PDFs de orçamento e recibo."
    />
  );
}
