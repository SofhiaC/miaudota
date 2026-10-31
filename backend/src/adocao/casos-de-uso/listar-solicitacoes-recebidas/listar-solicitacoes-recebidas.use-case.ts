import { Injectable } from '@nestjs/common';
import { DetalharSolicitacoes } from '../../application/detalhar-solicitacoes';
import { AnimalRepository, SolicitacaoRepository } from '../../domain/repositorios';

/** Solicitações abertas nos animais do usuário (ele é o dono). */
@Injectable()
export class ListarSolicitacoesRecebidas {
  constructor(
    private animais: AnimalRepository,
    private solicitacoes: SolicitacaoRepository,
    private detalhar: DetalharSolicitacoes,
  ) {}

  async executar(idDono: string) {
    const meus = await this.animais.listarDoDono(idDono);
    const solicitacoes = await this.solicitacoes.listarPorAnimais(meus.map((a) => a.id));
    return this.detalhar.executar(solicitacoes, true);
  }
}
