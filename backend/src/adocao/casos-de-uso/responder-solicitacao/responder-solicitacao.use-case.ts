import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { AnimalRepository, SolicitacaoRepository } from '../../domain/repositorios';

@Injectable()
export class ResponderSolicitacao {
  constructor(private animais: AnimalRepository, private solicitacoes: SolicitacaoRepository) {}

  async executar(id: string, idUsuario: string, status: 'APROVADA' | 'RECUSADA') {
    const solicitacao = await this.solicitacoes.buscarPorId(id);
    if (!solicitacao) throw new NaoEncontradoError('Solicitação não encontrada');

    const animal = await this.animais.buscarPorId(solicitacao.idAnimal);
    if (!animal) throw new NaoEncontradoError('Animal não encontrado');
    if (!animal.ehDe(idUsuario)) throw new AcessoNegadoError('Acesso negado'); // só o dono responde

    solicitacao.responder(status); // regra de domínio: precisa estar pendente
    await this.solicitacoes.salvar(solicitacao);

    if (status === 'APROVADA') {
      animal.marcarComoAdotado();
      await this.animais.salvar(animal);
      await this.solicitacoes.recusarPendentesDoAnimal(animal.id, solicitacao.id);
    }
    return solicitacao;
  }
}
