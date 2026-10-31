import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { feiraParaJson } from '../../presentation/presenters';
import { ListarFeirasProximas } from './listar-feiras-proximas.use-case';

export class ProximasQueryDto {
  @Type(() => Number) @IsNumber() @Min(-90) @Max(90) lat: number;
  @Type(() => Number) @IsNumber() @Min(-180) @Max(180) lng: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(500) raioKm?: number;
}

@Controller('feiras')
export class ListarFeirasProximasController {
  constructor(private caso: ListarFeirasProximas) {}

  @Get('proximas')
  async listar(@Query() q: ProximasQueryDto) {
    return (await this.caso.executar(q.lat, q.lng, q.raioKm)).map(feiraParaJson);
  }
}
