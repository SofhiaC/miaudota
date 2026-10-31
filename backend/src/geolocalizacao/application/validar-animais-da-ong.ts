import { RegraDeNegocioError } from '../../shared/errors';
import { AnimaisGateway } from './animais.gateway';

/** A ONG só pode levar à feira animais que são dela e ainda estão disponíveis. */
export async function validarAnimaisDaOng(animais: AnimaisGateway, idOng: string, ids: string[] = []) {
  const unicos = [...new Set(ids)];
  if (!unicos.length) return [];
  const validos = await animais.contarDisponiveisDoDono(idOng, unicos);
  if (validos !== unicos.length) {
    throw new RegraDeNegocioError('Só é possível levar à feira animais seus e disponíveis');
  }
  return unicos;
}
