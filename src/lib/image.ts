export async function comprimirImagem(
  file: File,
  maxLado = 1200,
  qualidade = 0.8,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", qualidade),
  );
  if (!blob) return file;

  const nomeBase = file.name.replace(/\.\w+$/, "") || "logo";
  return new File([blob], `${nomeBase}.jpg`, { type: "image/jpeg" });
}
