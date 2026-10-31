import { Injectable } from '@nestjs/common';
import { AnimalRepository } from '../../domain/repositorios';

/** Animais disponíveis de outras pessoas (os do próprio usuário não aparecem). */
@Injectable()
export class ListarAnimais {
  constructor(private animais: AnimalRepository) {}

  executar(idUsuario: string) {
    return this.animais.listarDisponiveisDeOutros(idUsuario);
  }
}
