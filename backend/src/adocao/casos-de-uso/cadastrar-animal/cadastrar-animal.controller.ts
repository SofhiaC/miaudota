import { Body, Controller, Post } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { CadastrarAnimal } from './cadastrar-animal.use-case';

export class CriarAnimalDto {
  @IsString() @MinLength(1) @MaxLength(60) nome: string;
  @IsString() @MinLength(2) @MaxLength(40) especie: string;
  @IsInt() @Min(0) @Max(40) idade: number;
  @IsOptional() @IsString() @MaxLength(500) descricao?: string;
}

@Controller('animais')
export class CadastrarAnimalController {
  constructor(private caso: CadastrarAnimal) {}

  @Post()
  async criar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: CriarAnimalDto) {
    return animalParaJson(await this.caso.executar({ ...dto, idDono: u.id }));
  }
}
