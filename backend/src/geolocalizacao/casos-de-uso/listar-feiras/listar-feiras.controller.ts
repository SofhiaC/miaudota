import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { feiraParaJson } from '../../presentation/presenters';
import { ListarFeiras } from './listar-feiras.use-case';

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class ListarFeirasController {
  constructor(private caso: ListarFeiras) {}

  @ApiOperation({ summary: 'Lista as feiras em andamento ou futuras' })
  @Get()
  async listar() {
    return (await this.caso.executar()).map(feiraParaJson);
  }
}
