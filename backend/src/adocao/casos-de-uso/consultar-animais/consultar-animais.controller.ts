import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { ConsultarAnimais } from './consultar-animais.use-case';

export class IdsDto {
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(500) @IsMongoId({ each: true }) ids: string[];
}

export class ContagemDoDonoDto {
  @ApiProperty() @IsMongoId() dono: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(100) @IsMongoId({ each: true }) ids: string[];
}

/** Rotas INTERNAS (só com a chave interna; o gateway nunca as expõe). Usadas pelo BFF e pelo serviço de geolocalização. */
@ApiTags('internos')
@ApiSecurity('chave-interna')
@Controller('internos/animais')
export class ConsultarAnimaisController {
  constructor(private caso: ConsultarAnimais) {}

  /** Dados dos animais que continuam disponíveis (o BFF usa para montar as feiras). */
  @ApiOperation({ summary: 'Interna: devolve os animais disponíveis entre os ids informados' })
  @Public() @Post('disponiveis') @HttpCode(200)
  async disponiveis(@Body() dto: IdsDto) {
    const animais = await this.caso.buscarDisponiveis(dto.ids);
    return animais.map((a) => ({ _id: a.id, nome: a.nome, especie: a.especie, idade: a.idade, descricao: a.descricao }));
  }

  /** Quantos dos ids são animais disponíveis desse dono (a geolocalização usa para validar a feira). */
  @ApiOperation({ summary: 'Interna: conta os animais disponíveis do dono dentro da lista de ids' })
  @Public() @Post('contagem-do-dono') @HttpCode(200)
  async contagem(@Body() dto: ContagemDoDonoDto) {
    return { total: await this.caso.contarDisponiveisDoDono(dto.dono, dto.ids) };
  }
}
