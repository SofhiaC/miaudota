import { Controller, Get } from '@nestjs/common';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarAnimais } from './listar-animais.use-case';

@Controller('animais')
export class ListarAnimaisController {
  constructor(private caso: ListarAnimais) {}

  @Roles('PESSOA') @Get()
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
