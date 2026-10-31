import { Injectable } from '@nestjs/common';
import { NaoEncontradoError } from '../../../shared/errors';
import { AnimalRepository, FavoritoRepository } from '../../domain/repositorios';

@Injectable()
export class FavoritarAnimal {
  constructor(private animais: AnimalRepository, private favoritos: FavoritoRepository) {}

  async executar(idAdotante: string, idAnimal: string) {
    if (!(await this.animais.buscarPorId(idAnimal))) throw new NaoEncontradoError('Animal não encontrado');
    await this.favoritos.salvar(idAdotante, idAnimal);
  }
}
