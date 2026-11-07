import { Injectable } from '@nestjs/common';
import { NaoEncontradoError } from '../../../shared/errors';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { FeiraRepository } from '../../domain/feira.repository';

@Injectable()
export class ObterFeira {
  constructor(private feiras: FeiraRepository, private montar: MontarVisaoDasFeiras) {}

  async executar(id: string) {
    const feira = await this.feiras.buscarPorId(id);
    if (!feira) throw new NaoEncontradoError('Feira não encontrada');
    return (await this.montar.executar([feira]))[0];
  }
}
