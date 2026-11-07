import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsMongoId } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { ConsultarResumosDeUsuarios } from './consultar-resumos.use-case';

export class IdsDto {
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(500) @IsMongoId({ each: true }) ids: string[];
}

/** Rota INTERNA (só com a chave interna; o gateway nunca a expõe). Usada pelo serviço de adoção. */
@ApiTags('internos')
@ApiSecurity('chave-interna')
@Controller('internos/usuarios')
export class ConsultarResumosController {
  constructor(private caso: ConsultarResumosDeUsuarios) {}

  @ApiOperation({ summary: 'Interna: nome e e-mail dos usuários pelos ids (usada pelo serviço de adoção e de geolocalização)' })
  @Public() @Post('resumos') @HttpCode(200)
  resumos(@Body() dto: IdsDto) {
    return this.caso.executar(dto.ids);
  }
}
