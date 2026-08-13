import { NextResponse } from "next/server";
import { getUsuarioAtual } from "@/lib/supabase/auth";
import { buscarDadosDaEmpresa, hojeISO, slug } from "@/lib/exportarDados";

export async function GET() {
  const { usuario, supabase } = await getUsuarioAtual();

  if (usuario?.role === "admin" || !usuario?.empresa_id) {
    return NextResponse.json(
      {
        error:
          "Administradores não têm uma empresa própria para exportar dados nesta fase.",
      },
      { status: 400 },
    );
  }

  const { dados, erro } = await buscarDadosDaEmpresa(
    supabase,
    usuario.empresa_id,
  );

  if (erro || !dados) {
    return NextResponse.json(
      { error: "Erro ao exportar os dados. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  const nomeEmpresa = slug((dados.empresa?.nome as string) ?? "empresa");
  const filename = `rtm-limp-export-${nomeEmpresa}-${hojeISO()}.json`;

  return new NextResponse(JSON.stringify(dados, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
