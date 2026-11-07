import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { solicitacaoParaJson } from '../../presentation/presenters';
import { ListarSolicitacoesRecebidas } from './listar-solicitacoes-recebidas.use-case';

@ApiTags('solicitacoes')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('solicitacoes')
export class ListarSolicitacoesRecebidasController {
  constructor(private caso: ListarSolicitacoesRecebidas) {}

  @ApiOperation({ summary: 'Lista as solicitações recebidas pelos animais do dono' })
  @Get('recebidas')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(solicitacaoParaJson);
  }
}
