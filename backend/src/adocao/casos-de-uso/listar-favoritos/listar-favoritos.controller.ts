import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarFavoritos } from './listar-favoritos.use-case';

@Roles('PESSOA')
@ApiTags('favoritos')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('favoritos')
export class ListarFavoritosController {
  constructor(private caso: ListarFavoritos) {}

  @ApiOperation({ summary: 'Lista os favoritos do adotante (PESSOA)' })
  @Get()
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
