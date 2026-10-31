import { Injectable } from '@nestjs/common';
import { NaoEncontradoError } from '../../../shared/errors';
import { EventPublisher, Eventos } from '../../../shared/events/eventos';
import { UsuarioRepository } from '../../domain/usuario.repository';

/**
 * LGPD: apaga os dados do próprio módulo e avisa os outros por evento.
 * Adoção e geolocalização apagam o que é delas ao receber UsuarioExcluido.
 */
@Injectable()
export class ExcluirConta {
  constructor(private usuarios: UsuarioRepository, private eventos: EventPublisher) {}

  async executar(id: string) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new NaoEncontradoError('Usuário não encontrado');

    await this.usuarios.excluir(id);
    await this.eventos.publicar(Eventos.UsuarioExcluido, { usuarioId: id, tipo: usuario.tipo });
  }
}
