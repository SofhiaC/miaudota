import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { FeiraRepository } from '../../domain/feira.repository';

@Injectable()
export class ExcluirFeira {
  constructor(private feiras: FeiraRepository) {}

  async executar(idFeira: string, idOng: string) {
    const feira = await this.feiras.buscarPorId(idFeira);
    if (!feira) throw new NaoEncontradoError('Feira não encontrada');
    if (!feira.ehDa(idOng)) throw new AcessoNegadoError('Acesso negado'); // só a ONG dona exclui
    await this.feiras.excluir(idFeira);
  }
}
