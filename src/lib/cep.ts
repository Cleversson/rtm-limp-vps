export type EnderecoViaCep = {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

export async function buscarEnderecoPorCep(
  cepDigits: string,
): Promise<EnderecoViaCep | null> {
  if (cepDigits.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
    if (!resposta.ok) return null;

    const data = await resposta.json();
    if (data.erro) return null;

    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch {
    return null;
  }
}
