import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

export async function renderPdfBuffer(
  document: ReactElement<DocumentProps>,
): Promise<Buffer> {
  return renderToBuffer(document);
}
