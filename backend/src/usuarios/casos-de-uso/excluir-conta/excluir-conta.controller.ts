import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ExcluirConta } from './excluir-conta.use-case';

@ApiTags('usuarios')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('usuarios')
export class ExcluirContaController {
  constructor(private caso: ExcluirConta) {}

  @ApiOperation({ summary: 'Exclui a conta do usuário e publica o evento UsuarioExcluido (LGPD)' })
  @Delete('me') @HttpCode(204)
  excluir(@UsuarioAtual() u: UsuarioLogado) {
    return this.caso.executar(u.id);
  }
}
