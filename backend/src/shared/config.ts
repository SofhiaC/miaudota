/** Configuração lida das variáveis de ambiente (o .env é carregado pelo main.ts de cada serviço). */

const avisos = new Set<string>();
function avisarUmaVez(chave: string, mensagem: string) {
  if (avisos.has(chave)) return;
  avisos.add(chave);
  console.warn(`[AVISO] ${mensagem}`);
}

export function segredoJwt() {
  const s = process.env.JWT_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET é obrigatório em produção');
  if (!s) avisarUmaVez('jwt', 'JWT_SECRET não definido, usando segredo de desenvolvimento.');
  return s || 'segredo-apenas-para-desenvolvimento';
}

/** Chave compartilhada entre gateway, BFF e serviços: sem ela, os serviços recusam a chamada. */
export function chaveInterna() {
  const s = process.env.INTERNAL_API_KEY;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('INTERNAL_API_KEY é obrigatório em produção');
  if (!s) avisarUmaVez('interna', 'INTERNAL_API_KEY não definido, usando chave de desenvolvimento.');
  return s || 'chave-interna-apenas-para-desenvolvimento';
}

export function urlRabbit() {
  return process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
}

export function uriMongo(dominio: 'USUARIOS' | 'ADOCAO' | 'GEOLOCALIZACAO') {
  return process.env[`MONGO_URI_${dominio}`] || `mongodb://localhost:27017/miaudota_${dominio.toLowerCase()}`;
}

export type NomeServico = 'usuarios' | 'adocao' | 'geolocalizacao' | 'bff';

const URLS_PADRAO: Record<NomeServico, string> = {
  usuarios: 'http://localhost:3101',
  adocao: 'http://localhost:3102',
  geolocalizacao: 'http://localhost:3103',
  bff: 'http://localhost:3001',
};

export function urlServico(nome: NomeServico) {
  return process.env[`URL_${nome.toUpperCase()}`] || URLS_PADRAO[nome];
}
