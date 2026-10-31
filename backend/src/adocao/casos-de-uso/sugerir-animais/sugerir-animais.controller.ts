import { Controller, Get } from '@nestjs/common';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { SugerirAnimais } from './sugerir-animais.use-case';

@Controller('animais')
export class SugerirAnimaisController {
  constructor(private caso: SugerirAnimais) {}

  @Roles('PESSOA') @Get('sugestoes')
  async sugerir(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
