import { Controller, Get } from '@nestjs/common';
import { feiraParaJson } from '../../presentation/presenters';
import { ListarFeiras } from './listar-feiras.use-case';

@Controller('feiras')
export class ListarFeirasController {
  constructor(private caso: ListarFeiras) {}

  @Get()
  async listar() {
    return (await this.caso.executar()).map(feiraParaJson);
  }
}
