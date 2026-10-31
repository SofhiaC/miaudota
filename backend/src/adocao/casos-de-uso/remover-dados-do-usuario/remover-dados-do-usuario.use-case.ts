import { Injectable } from '@nestjs/common';
import { AnimalRepository, FavoritoRepository, SolicitacaoRepository } from '../../domain/repositorios';

/** LGPD: apaga animais, favoritos e solicitações de quem excluiu a conta. */
@Injectable()
export class RemoverDadosDoUsuario {
  constructor(
    private animais: AnimalRepository,
    private favoritos: FavoritoRepository,
    private solicitacoes: SolicitacaoRepository,
  ) {}

  async executar(idUsuario: string) {
    // 1) animais do usuário e tudo que aponta para eles
    const ids = (await this.animais.listarDoDono(idUsuario)).map((a) => a.id);
    await this.favoritos.removerPorAnimais(ids);
    await this.solicitacoes.removerPorAnimais(ids);
    await this.animais.excluirDoDono(idUsuario);

    // 2) o que o usuário fez como adotante
    await this.favoritos.removerDoAdotante(idUsuario);
    await this.solicitacoes.removerDoAdotante(idUsuario);
  }
}
