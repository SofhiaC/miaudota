import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { solicitacaoParaJson } from '../../presentation/presenters';
import { BuscarSolicitacao } from './buscar-solicitacao.use-case';

@ApiTags('solicitacoes')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('solicitacoes')
export class BuscarSolicitacaoController {
  constructor(private caso: BuscarSolicitacao) {}

  // precisa ser registrado depois de /solicitacoes/enviadas e /recebidas (ver adocao.module.ts)
  @ApiOperation({ summary: 'Busca uma solicitação de adoção pelo id' })
  @Get(':id')
  async buscar(@Param('id', ParseObjectIdPipe) id: string, @UsuarioAtual() u: UsuarioLogado) {
    return solicitacaoParaJson(await this.caso.executar(id, u.id));
  }
}
