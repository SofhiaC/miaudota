import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { solicitacaoParaJson } from '../../presentation/presenters';
import { ListarSolicitacoesEnviadas } from './listar-solicitacoes-enviadas.use-case';

@ApiTags('solicitacoes')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('solicitacoes')
export class ListarSolicitacoesEnviadasController {
  constructor(private caso: ListarSolicitacoesEnviadas) {}

  @ApiOperation({ summary: 'Lista as solicitações enviadas pelo adotante' })
  @Get('enviadas')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(solicitacaoParaJson);
  }
}
