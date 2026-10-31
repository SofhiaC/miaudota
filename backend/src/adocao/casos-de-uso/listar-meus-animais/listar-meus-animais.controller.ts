import { Controller, Get } from '@nestjs/common';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarMeusAnimais } from './listar-meus-animais.use-case';

@Controller('animais')
export class ListarMeusAnimaisController {
  constructor(private caso: ListarMeusAnimais) {}

  @Get('meus')
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
