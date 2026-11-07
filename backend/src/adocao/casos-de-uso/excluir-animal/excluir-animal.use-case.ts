import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError, RegraDeNegocioError } from '../../../shared/errors';
import { AnimalRepository, FavoritoRepository, SolicitacaoRepository } from '../../domain/repositorios';

@Injectable()
export class ExcluirAnimal {
  constructor(
    private animais: AnimalRepository,
    private favoritos: FavoritoRepository,
    private solicitacoes: SolicitacaoRepository,
  ) {}

  async executar(idAnimal: string, idUsuario: string) {
    const animal = await this.animais.buscarPorId(idAnimal);
    if (!animal) throw new NaoEncontradoError('Animal não encontrado');
    if (!animal.ehDe(idUsuario)) throw new AcessoNegadoError('Acesso negado'); // só o dono exclui
    if (animal.adotado) throw new RegraDeNegocioError('Animal já adotado não pode ser excluído');

    // favoritos e solicitações apontam para o animal: saem junto. (Feiras que o listam ficam com uma
    // referência órfã, ignorada na consulta, conforme o ADR 9.6.)
    await this.favoritos.removerPorAnimais([idAnimal]);
    await this.solicitacoes.removerPorAnimais([idAnimal]);
    await this.animais.excluir(idAnimal);
  }
}
