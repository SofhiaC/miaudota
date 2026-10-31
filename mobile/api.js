// Android emulator: 10.0.2.2 | iOS simulator: localhost | celular físico: IP da máquina
export const API_URL = 'http://10.0.2.2:3000';

let token = null;
let aoExpirar = () => {};
export const setToken = (t) => { token = t; };
export const setAoExpirar = (fn) => { aoExpirar = fn; };

async function req(path, method = 'GET', body) {
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!res.ok) {
    if (res.status === 401 && token) aoExpirar(); // token expirou: volta pro login
    const msg = Array.isArray(dados?.mensagem) ? dados.mensagem.join('\n') : dados?.mensagem;
    throw new Error(msg || `Erro ${res.status}`);
  }
  return dados;
}

export const api = {
  // conta
  login: (email, senha) => req('/usuarios/login', 'POST', { email, senha }),
  cadastrar: (dados) => req('/usuarios', 'POST', dados),
  excluirConta: () => req('/usuarios/me', 'DELETE'),
  // animais
  animais: () => req('/animais'),
  sugestoes: () => req('/animais/sugestoes'),
  meusAnimais: () => req('/animais/meus'),
  criarAnimal: (dados) => req('/animais', 'POST', dados),
  // favoritos
  curtir: (id_animal) => req('/favoritos', 'POST', { id_animal }),
  favoritos: () => req('/favoritos'),
  descurtir: (id_animal) => req(`/favoritos/${id_animal}`, 'DELETE'),
  // solicitações
  solicitar: (id_animal) => req('/solicitacoes', 'POST', { id_animal }),
  enviadas: () => req('/solicitacoes/enviadas'),
  recebidas: () => req('/solicitacoes/recebidas'),
  responderSolicitacao: (id, status) => req(`/solicitacoes/${id}/status`, 'PATCH', { status }),
  // feiras
  feiras: () => req('/feiras'),
  feirasProximas: (lat, lng, raioKm = 100) => req(`/feiras/proximas?lat=${lat}&lng=${lng}&raioKm=${raioKm}`),
  criarFeira: (dados) => req('/feiras', 'POST', dados),
  definirAnimaisFeira: (id, animais) => req(`/feiras/${id}/animais`, 'PATCH', { animais }),
};
