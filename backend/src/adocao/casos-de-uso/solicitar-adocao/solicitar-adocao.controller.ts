import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { SolicitarAdocao } from './solicitar-adocao.use-case';

export class SolicitarDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' }) @IsMongoId() id_animal: string;
}

@ApiTags('solicitacoes')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('solicitacoes')
export class SolicitarAdocaoController {
  constructor(private caso: SolicitarAdocao) {}

  @ApiOperation({ summary: 'Abre uma solicitação de adoção (PESSOA)' })
  @Roles('PESSOA') @Post()
  async solicitar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: SolicitarDto) {
    const s = await this.caso.executar(u.id, dto.id_animal);
    return { _id: s.id, id_animal: s.idAnimal, status: s.status };
  }
}
