import { Controller, Delete, HttpCode, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ExcluirFeira } from './excluir-feira.use-case';

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class ExcluirFeiraController {
  constructor(private caso: ExcluirFeira) {}

  @ApiOperation({ summary: 'Exclui a feira (somente a ONG dona)' })
  @Roles('ONG') @Delete(':id') @HttpCode(204)
  async excluir(@Param('id', ParseUUIDPipe) id: string, @UsuarioAtual() u: UsuarioLogado) {
    await this.caso.executar(id, u.id);
  }
}
