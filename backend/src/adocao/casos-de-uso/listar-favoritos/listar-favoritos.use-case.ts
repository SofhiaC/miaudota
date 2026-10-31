import { Injectable } from '@nestjs/common';
import { Animal } from '../../domain/animal';
import { AnimalRepository, FavoritoRepository } from '../../domain/repositorios';

/** Devolve os animais favoritados, do mais recente para o mais antigo. */
@Injectable()
export class ListarFavoritos {
  constructor(private animais: AnimalRepository, private favoritos: FavoritoRepository) {}

  async executar(idAdotante: string): Promise<Animal[]> {
    const favoritos = await this.favoritos.listarDoAdotante(idAdotante);
    const animais = await this.animais.buscarPorIds(favoritos.map((f) => f.idAnimal));
    const porId = new Map(animais.map((a) => [a.id, a]));
    return favoritos.map((f) => porId.get(f.idAnimal)).filter((a): a is Animal => !!a);
  }
}
