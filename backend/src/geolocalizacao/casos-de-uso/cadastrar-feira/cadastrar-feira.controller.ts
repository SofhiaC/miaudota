import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ArrayMaxSize, IsArray, IsDateString, IsMongoId, IsNumber, IsOptional,
  IsString, Max, MaxLength, Min, MinLength,
} from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { feiraParaJson } from '../../presentation/presenters';
import { CadastrarFeira } from './cadastrar-feira.use-case';

export class CriarFeiraDto {
  @ApiProperty({ example: 'Feira de Adoção do Parque' }) @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) descricao?: string;
  @ApiProperty({ example: 'Parque Barigui, Curitiba' }) @IsString() @MinLength(3) @MaxLength(200) endereco: string;
  @ApiProperty({ example: -25.4244 }) @IsNumber() @Min(-90) @Max(90) latitude: number;
  @ApiProperty({ example: -49.3074 }) @IsNumber() @Min(-180) @Max(180) longitude: number;
  @ApiProperty({ example: '2026-12-05T09:00:00.000Z' }) @IsDateString() dataInicio: string;
  @ApiProperty({ example: '2026-12-05T17:00:00.000Z' }) @IsDateString() dataFim: string;
  @ApiPropertyOptional({ type: [String], description: 'Ids de animais da ONG (serviço de adoção)' })
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsMongoId({ each: true }) animais?: string[];
}

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class CadastrarFeiraController {
  constructor(private caso: CadastrarFeira) {}

  @ApiOperation({ summary: 'Cadastra uma feira de adoção (ONG)' })
  @Roles('ONG') @Post()
  async criar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: CriarFeiraDto) {
    return feiraParaJson(await this.caso.executar({ ...dto, idOng: u.id }));
  }
}
