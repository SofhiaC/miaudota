import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { ObterPerfil } from './obter-perfil.use-case';

@ApiTags('usuarios')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('usuarios')
export class ObterPerfilController {
  constructor(private caso: ObterPerfil) {}

  @ApiOperation({ summary: 'Dados do usuário logado' })
  @Get('me')
  async me(@UsuarioAtual() u: UsuarioLogado) {
    return usuarioParaJson(await this.caso.executar(u.id));
  }
}
