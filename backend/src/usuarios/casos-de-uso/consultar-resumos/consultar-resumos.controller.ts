import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { ConsultarResumosDeUsuarios } from './consultar-resumos.use-case';

export class IdsDto {
  @IsArray() @ArrayMaxSize(500) @IsMongoId({ each: true }) ids: string[];
}

/** Rota INTERNA (só com a chave interna; o gateway nunca a expõe). Usada pelo serviço de adoção. */
@Controller('internos/usuarios')
export class ConsultarResumosController {
  constructor(private caso: ConsultarResumosDeUsuarios) {}

  @Public() @Post('resumos') @HttpCode(200)
  resumos(@Body() dto: IdsDto) {
    return this.caso.executar(dto.ids);
  }
}
