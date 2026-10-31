import { Body, Controller, Post } from '@nestjs/common';
import { IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { FavoritarAnimal } from './favoritar-animal.use-case';

export class FavoritarDto {
  @IsMongoId() id_animal: string;
}

@Roles('PESSOA')
@Controller('favoritos')
export class FavoritarAnimalController {
  constructor(private caso: FavoritarAnimal) {}

  @Post()
  async favoritar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: FavoritarDto) {
    await this.caso.executar(u.id, dto.id_animal);
    return { ok: true };
  }
}
