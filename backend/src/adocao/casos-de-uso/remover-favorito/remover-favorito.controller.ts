import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { RemoverFavorito } from './remover-favorito.use-case';

@Roles('PESSOA')
@ApiTags('favoritos')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('favoritos')
export class RemoverFavoritoController {
  constructor(private caso: RemoverFavorito) {}

  @ApiOperation({ summary: 'Remove um animal dos favoritos (PESSOA)' })
  @Delete(':idAnimal') @HttpCode(204)
  remover(@UsuarioAtual() u: UsuarioLogado, @Param('idAnimal', ParseObjectIdPipe) idAnimal: string) {
    return this.caso.executar(u.id, idAnimal);
  }
}
