import { Injectable } from '@nestjs/common';
import { FeiraRepository } from '../../domain/feira.repository';

/** LGPD: apaga as feiras de quem excluiu a conta. */
@Injectable()
export class RemoverFeirasDaOng {
  constructor(private feiras: FeiraRepository) {}

  executar(idOng: string) {
    return this.feiras.excluirDaOng(idOng);
  }
}
