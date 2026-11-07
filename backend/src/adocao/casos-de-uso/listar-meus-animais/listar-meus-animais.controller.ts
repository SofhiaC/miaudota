import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarMeusAnimais } from './listar-meus-animais.use-case';

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class ListarMeusAnimaisController {
  constructor(private caso: ListarMeusAnimais) {}

  @ApiOperation({ summary: 'Lista os animais do usuário logado' })
  @Get('meus')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
