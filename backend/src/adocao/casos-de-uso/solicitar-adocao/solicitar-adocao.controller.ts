import { Body, Controller, Post } from '@nestjs/common';
import { IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { SolicitarAdocao } from './solicitar-adocao.use-case';

export class SolicitarDto {
  @IsMongoId() id_animal: string;
}

@Controller('solicitacoes')
export class SolicitarAdocaoController {
  constructor(private caso: SolicitarAdocao) {}

  @Roles('PESSOA') @Post()
  async solicitar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: SolicitarDto) {
    const s = await this.caso.executar(u.id, dto.id_animal);
    return { _id: s.id, id_animal: s.idAnimal, status: s.status };
  }
}
