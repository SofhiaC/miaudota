import { Injectable } from '@nestjs/common';
import { NovoAnimal } from '../../domain/animal';
import { AnimalRepository } from '../../domain/repositorios';

@Injectable()
export class CadastrarAnimal {
  constructor(private animais: AnimalRepository) {}

  executar(dados: NovoAnimal) {
    return this.animais.criar(dados);
  }
}
