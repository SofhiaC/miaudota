import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { FavoritarAnimal } from './favoritar-animal.use-case';

export class FavoritarDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' }) @IsMongoId() id_animal: string;
}

@Roles('PESSOA')
@ApiTags('favoritos')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('favoritos')
export class FavoritarAnimalController {
  constructor(private caso: FavoritarAnimal) {}

  @ApiOperation({ summary: 'Favorita (curte) um animal (PESSOA)' })
  @Post()
  async favoritar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: FavoritarDto) {
    await this.caso.executar(u.id, dto.id_animal);
    return { ok: true };
  }
}
