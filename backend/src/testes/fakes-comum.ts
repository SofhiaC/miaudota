import { EventPublisher, NomeEvento } from '../shared/events/eventos';

/** Dublês e constantes usados por todos os serviços. */
export const DONO = 'aaaaaaaaaaaaaaaaaaaaaaaa';
export const ADOTANTE = 'bbbbbbbbbbbbbbbbbbbbbbbb';
export const OUTRO = 'cccccccccccccccccccccccc';

export class EventPublisherFake extends EventPublisher {
  publicados: { nome: NomeEvento; dados: Record<string, unknown> }[] = [];
  async publicar(nome: NomeEvento, dados: Record<string, unknown>) { this.publicados.push({ nome, dados }); }
}

export const emDias = (n: number) => new Date(Date.now() + n * 86_400_000);
