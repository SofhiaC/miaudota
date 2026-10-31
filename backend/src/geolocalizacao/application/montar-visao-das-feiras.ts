import { Injectable } from '@nestjs/common';
import { Feira } from '../domain/feira';
import { distanciaKm } from '../domain/localizacao';

export type FeiraComAnimais = { feira: Feira; animais: string[]; distanciaKm?: number };

/** Prepara as feiras para a resposta: ids dos animais e, quando há origem, a distância em km. */
@Injectable()
export class MontarVisaoDasFeiras {
  async executar(feiras: Feira[], origem?: { lat: number; lng: number }): Promise<FeiraComAnimais[]> {
    return feiras.map((feira) => ({
      feira,
      animais: feira.animais,
      distanciaKm: origem
        ? Number(distanciaKm(origem.lat, origem.lng, feira.latitude, feira.longitude).toFixed(1))
        : undefined,
    }));
  }
}
