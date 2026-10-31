import { Injectable } from '@nestjs/common';
import { FavoritoRepository } from '../../domain/repositorios';

@Injectable()
export class RemoverFavorito {
  constructor(private favoritos: FavoritoRepository) {}

  executar(idAdotante: string, idAnimal: string) {
    return this.favoritos.remover(idAdotante, idAnimal);
  }
}
