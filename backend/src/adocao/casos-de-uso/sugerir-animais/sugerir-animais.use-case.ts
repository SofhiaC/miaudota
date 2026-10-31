import { Injectable } from '@nestjs/common';
import { AnimalRepository, FavoritoRepository } from '../../domain/repositorios';

/** Sugere animais disponíveis das espécies que o usuário já curtiu, as mais curtidas primeiro. */
@Injectable()
export class SugerirAnimais {
  constructor(private animais: AnimalRepository, private favoritos: FavoritoRepository) {}

  async executar(idUsuario: string) {
    const favoritos = await this.favoritos.listarDoAdotante(idUsuario);
    if (!favoritos.length) return [];

    const idsFavoritos = favoritos.map((f) => f.idAnimal);
    const curtidos = await this.animais.buscarPorIds(idsFavoritos);

    const pontos: Record<string, number> = {};
    curtidos.forEach((a) => { pontos[a.especie] = (pontos[a.especie] || 0) + 1; });

    const candidatos = await this.animais.sugerirPorEspecies(Object.keys(pontos), idUsuario, idsFavoritos);
    return candidatos.sort((a, b) => pontos[b.especie] - pontos[a.especie]).slice(0, 10);
  }
}
