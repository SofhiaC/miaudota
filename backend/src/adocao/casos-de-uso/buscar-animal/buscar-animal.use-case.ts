import { Injectable } from '@nestjs/common';
import { NaoEncontradoError } from '../../../shared/errors';
import { AnimalRepository } from '../../domain/repositorios';

@Injectable()
export class BuscarAnimal {
  constructor(private animais: AnimalRepository) {}

  async executar(id: string) {
    const animal = await this.animais.buscarPorId(id);
    if (!animal) throw new NaoEncontradoError('Animal não encontrado');
    return animal;
  }
}
