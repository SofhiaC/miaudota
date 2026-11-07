import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { feiraParaJson } from '../../presentation/presenters';
import { ObterFeira } from './obter-feira.use-case';

@ApiTags('feiras')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('feiras')
export class ObterFeiraController {
  constructor(private caso: ObterFeira) {}

  @ApiOperation({ summary: 'Busca uma feira pelo id' })
  @Get(':id')
  async obter(@Param('id', ParseUUIDPipe) id: string) {
    return feiraParaJson(await this.caso.executar(id));
  }
}
