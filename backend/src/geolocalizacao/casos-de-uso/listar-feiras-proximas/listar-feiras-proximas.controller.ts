import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { feiraParaJson } from '../../presentation/presenters';
import { ListarFeirasProximas } from './listar-feiras-proximas.use-case';

export class ProximasQueryDto {
  @ApiProperty({ example: -25.4244 }) @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat: number;
  @ApiProperty({ example: -49.3074 }) @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng: number;
  @ApiPropertyOptional({ example: 50, description: 'Raio em km (padrão 50)' }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(500) raioKm?: number;
}

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class ListarFeirasProximasController {
  constructor(private caso: ListarFeirasProximas) {}

  @ApiOperation({ summary: 'Lista feiras próximas de uma coordenada, da mais perto para a mais longe' })
  @Get('proximas')
  async listar(@Query() q: ProximasQueryDto) {
    return (await this.caso.executar(q.lat, q.lng, q.raioKm)).map(feiraParaJson);
  }
}
