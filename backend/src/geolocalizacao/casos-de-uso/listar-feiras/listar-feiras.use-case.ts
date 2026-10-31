import { Injectable } from '@nestjs/common';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { FeiraRepository } from '../../domain/feira.repository';

/** Feiras acontecendo agora ou futuras (feiras encerradas somem). */
@Injectable()
export class ListarFeiras {
  constructor(private feiras: FeiraRepository, private montar: MontarVisaoDasFeiras) {}

  async executar() {
    return this.montar.executar(await this.feiras.listarAtivas(new Date()));
  }
}
