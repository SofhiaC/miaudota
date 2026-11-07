import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { animalParaJson } from '../../presentation/presenters';
import { CadastrarAnimal } from './cadastrar-animal.use-case';

export class CriarAnimalDto {
  @ApiProperty({ example: 'Mel' }) @IsString() @MinLength(1) @MaxLength(60) nome: string;
  @ApiProperty({ example: 'cachorro' }) @IsString() @MinLength(2) @MaxLength(40) especie: string;
  @ApiProperty({ example: 2, description: 'Idade em anos' }) @IsInt() @Min(0) @Max(40) idade: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) descricao?: string;
}

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class CadastrarAnimalController {
  constructor(private caso: CadastrarAnimal) {}

  @ApiOperation({ summary: 'Cadastra um animal para adoção' })
  @Post()
  async criar(@UsuarioAtual() u: UsuarioLogado, @Body() dto: CriarAnimalDto) {
    return animalParaJson(await this.caso.executar({ ...dto, idDono: u.id }));
  }
}
