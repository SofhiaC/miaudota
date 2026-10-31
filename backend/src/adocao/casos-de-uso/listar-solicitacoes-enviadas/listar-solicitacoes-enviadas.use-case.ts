import { Injectable } from '@nestjs/common';
import { DetalharSolicitacoes } from '../../application/detalhar-solicitacoes';
import { SolicitacaoRepository } from '../../domain/repositorios';

@Injectable()
export class ListarSolicitacoesEnviadas {
  constructor(private solicitacoes: SolicitacaoRepository, private detalhar: DetalharSolicitacoes) {}

  async executar(idAdotante: string) {
    return this.detalhar.executar(await this.solicitacoes.listarDoAdotante(idAdotante), false);
  }
}
