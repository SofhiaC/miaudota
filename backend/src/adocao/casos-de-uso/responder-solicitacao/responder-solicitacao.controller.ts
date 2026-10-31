import { Body, Controller, Param, Patch } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { ResponderSolicitacao } from './responder-solicitacao.use-case';

export class ResponderSolicitacaoDto {
  @IsIn(['APROVADA', 'RECUSADA']) status: 'APROVADA' | 'RECUSADA';
}

@Controller('solicitacoes')
export class ResponderSolicitacaoController {
  constructor(private caso: ResponderSolicitacao) {}

  @Patch(':id/status')
  async responder(
    @Param('id', ParseObjectIdPipe) id: string,
    @UsuarioAtual() u: UsuarioLogado,
    @Body() dto: ResponderSolicitacaoDto,
  ) {
    const s = await this.caso.executar(id, u.id, dto.status);
    return { _id: s.id, status: s.status };
  }
}
