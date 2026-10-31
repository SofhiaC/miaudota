import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { DetalharSolicitacoes } from '../../application/detalhar-solicitacoes';
import { AnimalRepository, SolicitacaoRepository } from '../../domain/repositorios';

@Injectable()
export class BuscarSolicitacao {
  constructor(
    private animais: AnimalRepository,
    private solicitacoes: SolicitacaoRepository,
    private detalhar: DetalharSolicitacoes,
  ) {}

  async executar(id: string, idUsuario: string) {
    const solicitacao = await this.solicitacoes.buscarPorId(id);
    if (!solicitacao) throw new NaoEncontradoError('Solicitação não encontrada');

    const animal = await this.animais.buscarPorId(solicitacao.idAnimal);
    const souDono = !!animal && animal.ehDe(idUsuario);
    // só quem pediu ou o dono do animal podem ver
    if (solicitacao.idAdotante !== idUsuario && !souDono) throw new AcessoNegadoError('Acesso negado');

    return (await this.detalhar.executar([solicitacao], souDono))[0];
  }
}
