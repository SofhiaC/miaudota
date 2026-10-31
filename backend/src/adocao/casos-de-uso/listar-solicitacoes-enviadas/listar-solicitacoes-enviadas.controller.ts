import { Controller, Get } from '@nestjs/common';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { solicitacaoParaJson } from '../../presentation/presenters';
import { ListarSolicitacoesEnviadas } from './listar-solicitacoes-enviadas.use-case';

@Controller('solicitacoes')
export class ListarSolicitacoesEnviadasController {
  constructor(private caso: ListarSolicitacoesEnviadas) {}

  @Get('enviadas')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(solicitacaoParaJson);
  }
}
