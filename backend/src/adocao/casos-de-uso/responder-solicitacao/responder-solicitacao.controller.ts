import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { ResponderSolicitacao } from './responder-solicitacao.use-case';

export class ResponderSolicitacaoDto {
  @ApiProperty({ enum: ['APROVADA', 'RECUSADA'] }) @IsIn(['APROVADA', 'RECUSADA']) status: 'APROVADA' | 'RECUSADA';
}

@ApiTags('solicitacoes')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('solicitacoes')
export class ResponderSolicitacaoController {
  constructor(private caso: ResponderSolicitacao) {}

  @ApiOperation({ summary: 'Aprova ou recusa uma solicitação (dono do animal)' })
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
