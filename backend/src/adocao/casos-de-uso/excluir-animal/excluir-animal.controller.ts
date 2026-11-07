import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UsuarioAtual, UsuarioLogado } from '../../../shared/auth/auth';
import { ParseObjectIdPipe } from '../../../shared/http/parse-object-id.pipe';
import { ExcluirAnimal } from './excluir-animal.use-case';

@ApiTags('animais')
@ApiSecurity('chave-interna')
@ApiSecurity('usuario-id')
@ApiSecurity('usuario-tipo')
@Controller('animais')
export class ExcluirAnimalController {
  constructor(private caso: ExcluirAnimal) {}

  @ApiOperation({ summary: 'Exclui o animal e seus favoritos/solicitações (somente o dono; animal adotado não pode ser excluído)' })
  @Delete(':id') @HttpCode(204)
  async excluir(@Param('id', ParseObjectIdPipe) id: string, @UsuarioAtual() u: UsuarioLogado) {
    await this.caso.executar(id, u.id);
  }
}
