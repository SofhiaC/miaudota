import { Controller, Get, Param } from '@nestjs/common';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { animalParaJson } from '../../presentation/presenters';
import { BuscarAnimal } from './buscar-animal.use-case';

@Controller('animais')
export class BuscarAnimalController {
  constructor(private caso: BuscarAnimal) {}

  // precisa ser registrado depois de /animais/meus e /animais/sugestoes (ver adocao.module.ts)
  @Get(':id')
  async buscar(@Param('id', ParseObjectIdPipe) id: string) {
    return animalParaJson(await this.caso.executar(id));
  }
}
