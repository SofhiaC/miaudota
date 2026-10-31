import { Body, Controller, Post } from '@nestjs/common';
import {
  ArrayMaxSize, IsArray, IsDateString, IsMongoId, IsNumber, IsOptional,
  IsString, Max, MaxLength, Min, MinLength,
} from 'class-validator';
import { Roles, UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { feiraParaJson } from '../../presentation/presenters';
import { CadastrarFeira } from './cadastrar-feira.use-case';

export class CriarFeiraDto {
  @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @IsOptional() @IsString() @MaxLength(500) descricao?: string;
  @IsString() @MinLength(3) @MaxLength(200) endereco: string;
  @IsNumber() @Min(-90) @Max(90) latitude: number;
  @IsNumber() @Min(-180) @Max(180) longitude: number;
  @IsDateString() dataInicio: string;
  @IsDateString() dataFim: string;
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsMongoId({ each: true }) animais?: string[];
}

@Controller('feiras')
export class CadastrarFeiraController {
  constructor(private caso: CadastrarFeira) {}

  @Roles('ONG') @Post()
  async criar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: CriarFeiraDto) {
    return feiraParaJson(await this.caso.executar({ ...dto, idOng: u.id }));
  }
}
