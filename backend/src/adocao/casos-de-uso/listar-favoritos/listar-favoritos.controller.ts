import { Controller, Get } from '@nestjs/common';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { ListarFavoritos } from './listar-favoritos.use-case';

@Roles('PESSOA')
@Controller('favoritos')
export class ListarFavoritosController {
  constructor(private caso: ListarFavoritos) {}

  @Get()
  async listar(@UsuarioAtual() u: UsuarioLogado) {
    return (await this.caso.executar(u.id)).map(animalParaJson);
  }
}
