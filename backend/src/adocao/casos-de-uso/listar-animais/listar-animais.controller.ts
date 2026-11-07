import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarAnimais } from './listar-animais.use-case';

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class ListarAnimaisController {
  constructor(private caso: ListarAnimais) {}

  @ApiOperation({ summary: 'Lista animais disponíveis de outros donos (PESSOA)' })
  @Roles('PESSOA') @Get()
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
