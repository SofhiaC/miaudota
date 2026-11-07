import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiPropertyOptional, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { animalParaJson } from '../../presentation/presenters';
import { AtualizarAnimal } from './atualizar-animal.use-case';

export class AtualizarAnimalDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(60) nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(40) especie?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(40) idade?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) descricao?: string;
}

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class AtualizarAnimalController {
  constructor(private caso: AtualizarAnimal) {}

  @ApiOperation({ summary: 'Atualiza os dados do animal (somente o dono; animal já adotado não pode ser alterado)' })
  @Patch(':id')
  async atualizar(
    @Param('id', ParseObjectIdPipe) id: string,
    @UsuarioAtual() u: UsuarioLogado,
    @Body() dto: AtualizarAnimalDto,
  ) {
    return animalParaJson(await this.caso.executar(id, u.id, dto));
  }
}
