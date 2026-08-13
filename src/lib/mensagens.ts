export type TipoMensagem = "orcamento" | "recibo" | "lembrete" | "confirmacao";

export const MENSAGENS_PADRAO: Record<TipoMensagem, string> = {
  orcamento:
    "Olá {cliente}! Segue seu orçamento de {empresa}. Valor: {valor}. Confira aqui: {link}",
  recibo:
    "Olá {cliente}! Segue o recibo do seu atendimento com {empresa} em {data}. {link}",
  lembrete:
    "Olá {cliente}! Já faz um tempinho desde sua última higienização com {empresa} ({data}). Que tal agendarmos a próxima? 😊",
  confirmacao:
    "Olá {cliente}! Confirmando seu atendimento com {empresa} em {data} às {horario}{servico}{endereco}. Até lá! 😊",
};

export const TITULO_POR_TIPO: Record<TipoMensagem, string> = {
  orcamento: "Orçamento",
  recibo: "Recibo",
  lembrete: "Lembrete de Próxima Higienização",
  confirmacao: "Confirmação de Agendamento",
};

export const VARIAVEIS_POR_TIPO: Record<
  TipoMensagem,
  { chave: string; descricao: string }[]
> = {
  orcamento: [
    { chave: "cliente", descricao: "Nome do cliente" },
    { chave: "empresa", descricao: "Nome da sua empresa" },
    { chave: "data", descricao: "Data de emissão do orçamento" },
    { chave: "valor", descricao: "Valor total do orçamento" },
    { chave: "link", descricao: "Link do PDF" },
  ],
  recibo: [
    { chave: "cliente", descricao: "Nome do cliente" },
    { chave: "empresa", descricao: "Nome da sua empresa" },
    { chave: "data", descricao: "Data do atendimento" },
    { chave: "valor", descricao: "Valor recebido" },
    { chave: "link", descricao: "Link do PDF" },
  ],
  lembrete: [
    { chave: "cliente", descricao: "Nome do cliente" },
    { chave: "empresa", descricao: "Nome da sua empresa" },
    { chave: "data", descricao: "Data da última higienização" },
  ],
  confirmacao: [
    { chave: "cliente", descricao: "Nome do cliente" },
    { chave: "empresa", descricao: "Nome da sua empresa" },
    { chave: "data", descricao: "Data do agendamento" },
    { chave: "horario", descricao: "Horário do agendamento" },
    { chave: "servico", descricao: "Nome do serviço (se houver)" },
    { chave: "endereco", descricao: "Endereço do atendimento" },
  ],
};

export function substituirVariaveis(
  template: string,
  valores: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, chave) => valores[chave] ?? match);
}

export function montarMensagemConfirmacao(params: {
  template: string;
  clienteNome: string;
  empresaNome: string;
  data: string;
  horaInicio: string;
  servicoNome: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
}): string {
  const enderecoTexto = [
    params.numero ? `${params.endereco}, ${params.numero}` : params.endereco,
    params.complemento,
    params.bairro,
    params.cidade,
  ]
    .filter(Boolean)
    .join(", ");

  return substituirVariaveis(params.template, {
    cliente: params.clienteNome,
    empresa: params.empresaNome,
    data: new Date(`${params.data}T00:00:00`).toLocaleDateString("pt-BR"),
    horario: params.horaInicio.slice(0, 5),
    servico: params.servicoNome ? ` para ${params.servicoNome}` : "",
    endereco: enderecoTexto ? `, em ${enderecoTexto}` : "",
  });
}
