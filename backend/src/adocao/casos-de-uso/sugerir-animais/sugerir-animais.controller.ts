import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { SugerirAnimais } from './sugerir-animais.use-case';

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class SugerirAnimaisController {
  constructor(private caso: SugerirAnimais) {}

  @ApiOperation({ summary: 'Sugere animais com base nas espécies curtidas (PESSOA)' })
  @Roles('PESSOA') @Get('sugestoes')
  async sugerir(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
