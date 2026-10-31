import { Injectable } from '@nestjs/common';
import { AnimalRepository } from '../../domain/repositorios';

@Injectable()
export class ListarMeusAnimais {
  constructor(private animais: AnimalRepository) {}

  executar(idDono: string) {
    return this.animais.listarDoDono(idDono);
  }
}
