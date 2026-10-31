import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { RemoverFavorito } from './remover-favorito.use-case';

@Roles('PESSOA')
@Controller('favoritos')
export class RemoverFavoritoController {
  constructor(private caso: RemoverFavorito) {}

  @Delete(':idAnimal') @HttpCode(204)
  remover(@UsuarioAtual() u: UsuarioLogado, @Param('idAnimal', ParseObjectIdPipe) idAnimal: string) {
    return this.caso.executar(u.id, idAnimal);
  }
}
