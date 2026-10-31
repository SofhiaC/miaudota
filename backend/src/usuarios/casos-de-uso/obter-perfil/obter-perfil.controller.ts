import { Controller, Get } from '@nestjs/common';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { ObterPerfil } from './obter-perfil.use-case';

@Controller('usuarios')
export class ObterPerfilController {
  constructor(private caso: ObterPerfil) {}

  @Get('me')
  async me(@UsuarioAtual() u: UsuarioLogado) {
    return usuarioParaJson(await this.caso.executar(u.id));
  }
}
