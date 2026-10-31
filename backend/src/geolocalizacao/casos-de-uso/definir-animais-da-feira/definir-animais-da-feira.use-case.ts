import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { AnimaisGateway } from '../../application/animais.gateway';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { validarAnimaisDaOng } from '../../application/validar-animais-da-ong';
import { FeiraRepository } from '../../domain/feira.repository';

@Injectable()
export class DefinirAnimaisDaFeira {
  constructor(
    private feiras: FeiraRepository,
    private animais: AnimaisGateway,
    private montar: MontarVisaoDasFeiras,
  ) {}

  async executar(idFeira: string, idOng: string, ids: string[]) {
    const feira = await this.feiras.buscarPorId(idFeira);
    if (!feira) throw new NaoEncontradoError('Feira não encontrada');
    if (!feira.ehDa(idOng)) throw new AcessoNegadoError('Acesso negado'); // só a ONG dona altera

    feira.definirAnimais(await validarAnimaisDaOng(this.animais, idOng, ids));
    await this.feiras.salvar(feira);

    return (await this.montar.executar([feira]))[0];
  }
}
