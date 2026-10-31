import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { feiraParaJson } from '../../presentation/presenters';
import { DefinirAnimaisDaFeira } from './definir-animais-da-feira.use-case';

export class AtualizarAnimaisFeiraDto {
  @IsArray() @ArrayMaxSize(100) @IsMongoId({ each: true }) animais: string[];
}

@Controller('feiras')
export class DefinirAnimaisDaFeiraController {
  constructor(private caso: DefinirAnimaisDaFeira) {}

  @Roles('ONG') @Patch(':id/animais')
  async definir(
    @Param('id', ParseObjectIdPipe) id: string,
    @UsuarioAtual() u: UsuarioLogado,
    @Body() dto: AtualizarAnimaisFeiraDto,
  ) {
    return feiraParaJson(await this.caso.executar(id, u.id, dto.animais));
  }
}
