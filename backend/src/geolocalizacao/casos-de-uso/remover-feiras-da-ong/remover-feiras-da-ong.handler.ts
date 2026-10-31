import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventSubscriber, Eventos } from '../../../shared/events/eventos';
import { RemoverFeirasDaOng } from './remover-feiras-da-ong.use-case';

@Injectable()
export class RemoverFeirasDaOngHandler implements OnModuleInit {
  constructor(private eventos: EventSubscriber, private caso: RemoverFeirasDaOng) {}

  onModuleInit() {
    this.eventos.inscrever(Eventos.UsuarioExcluido, (dados) => this.caso.executar(dados.usuarioId));
  }
}
