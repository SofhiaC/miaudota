import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { calcularIndicador } from '../dominio/indicador';

function lerInteiro(valor: string | null): number | null {
  if (valor === null || !/^\d{1,9}$/.test(valor)) return null;
  return Number(valor);
}

/** GET /api/indicador-adocao?animais=12&feiras=3 */
export async function indicadorAdocao(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const animais = lerInteiro(req.query.get('animais'));
  const feiras = lerInteiro(req.query.get('feiras'));
  if (animais === null || feiras === null) {
    return { status: 400, jsonBody: { erro: 'Informe os parâmetros inteiros "animais" e "feiras" (valores >= 0)' } };
  }
  ctx.log(`indicador-adocao animais=${animais} feiras=${feiras} correlacao=${req.headers.get('x-correlation-id') ?? '-'}`);
  return { status: 200, jsonBody: calcularIndicador(animais, feiras) };
}

// authLevel "function": na nuvem exige a chave da função (cabeçalho x-functions-key), que o BFF envia.
app.http('indicadorAdocao', {
  methods: ['GET'],
  authLevel: 'function',
  route: 'indicador-adocao',
  handler: indicadorAdocao,
});
