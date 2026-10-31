import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventSubscriber, Eventos } from '../../../shared/events/eventos';
import { RemoverDadosDoUsuario } from './remover-dados-do-usuario.use-case';

/** Adaptador de entrada: transforma o evento UsuarioExcluido na chamada do caso de uso. */
@Injectable()
export class RemoverDadosDoUsuarioHandler implements OnModuleInit {
  constructor(private eventos: EventSubscriber, private caso: RemoverDadosDoUsuario) {}

  onModuleInit() {
    this.eventos.inscrever(Eventos.UsuarioExcluido, (dados) => this.caso.executar(dados.usuarioId));
  }
}
