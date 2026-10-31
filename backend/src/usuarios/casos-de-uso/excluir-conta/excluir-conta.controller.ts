import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ExcluirConta } from './excluir-conta.use-case';

@Controller('usuarios')
export class ExcluirContaController {
  constructor(private caso: ExcluirConta) {}

  @Delete('me') @HttpCode(204)
  excluir(@UsuarioAtual() u: UsuarioLogado) {
    return this.caso.executar(u.id);
  }
}
