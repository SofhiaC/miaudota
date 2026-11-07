import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { animalParaJson } from '../../presentation/presenters';
import { BuscarAnimal } from './buscar-animal.use-case';

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class BuscarAnimalController {
  constructor(private caso: BuscarAnimal) {}

  // precisa ser registrado depois de /animais/meus e /animais/sugestoes (ver adocao.module.ts)
  @ApiOperation({ summary: 'Busca um animal pelo id' })
  @Get(':id')
  async buscar(@Param('id', ParseObjectIdPipe) id: string) {
    return animalParaJson(await this.caso.executar(id));
  }
}
