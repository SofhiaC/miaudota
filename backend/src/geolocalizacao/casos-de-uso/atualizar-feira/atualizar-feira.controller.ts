import { Body, Controller, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiPropertyOptional, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { feiraParaJson } from '../../presentation/presenters';
import { AtualizarFeira } from './atualizar-feira.use-case';

export class AtualizarFeiraDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) nome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) descricao?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(3) @MaxLength(200) endereco?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
  @ApiPropertyOptional({ example: '2026-12-05T09:00:00.000Z' }) @IsOptional() @IsDateString() dataInicio?: string;
  @ApiPropertyOptional({ example: '2026-12-05T17:00:00.000Z' }) @IsOptional() @IsDateString() dataFim?: string;
}

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class AtualizarFeiraController {
  constructor(private caso: AtualizarFeira) {}

  @ApiOperation({ summary: 'Atualiza os dados da feira (somente a ONG dona)' })
  @Roles('ONG') @Patch(':id')
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioAtual() u: UsuarioLogado,
    @Body() dto: AtualizarFeiraDto,
  ) {
    return feiraParaJson(await this.caso.executar(id, u.id, dto));
  }
}
