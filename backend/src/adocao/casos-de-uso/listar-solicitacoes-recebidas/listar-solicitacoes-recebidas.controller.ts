import { Controller, Get } from '@nestjs/common';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { solicitacaoParaJson } from '../../presentation/presenters';
import { ListarSolicitacoesRecebidas } from './listar-solicitacoes-recebidas.use-case';

@Controller('solicitacoes')
export class ListarSolicitacoesRecebidasController {
  constructor(private caso: ListarSolicitacoesRecebidas) {}

  @Get('recebidas')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(solicitacaoParaJson);
  }
}
