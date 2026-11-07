import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { feiraParaJson } from '../../presentation/presenters';
import { DefinirAnimaisDaFeira } from './definir-animais-da-feira.use-case';

export class AtualizarAnimaisFeiraDto {
  @ApiProperty({ type: [String], description: 'Ids dos animais (substitui a lista atual)' })
  @IsArray() @ArrayMaxSize(100) @IsMongoId({ each: true }) animais: string[];
}

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class DefinirAnimaisDaFeiraController {
  constructor(private caso: DefinirAnimaisDaFeira) {}

  @ApiOperation({ summary: 'Define os animais que estarão na feira (somente a ONG dona)' })
  @Roles('ONG') @Patch(':id/animais')
  async definir(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: UsuarioLogado,
    @Body() dto: AtualizarAnimaisFeiraDto,
  ) {
    return feiraParaJson(await this.caso.executar(id, u.id, dto.animais));
  }
}
