import { Injectable } from '@nestjs/common';
import { AnimalRepository } from '../../domain/repositorios';

export type ResumoDeAnimal = { id: string; nome: string; especie: string; idade: number; descricao?: string };

/**
 * API pública do módulo de adoção para outros módulos (sem rota HTTP).
 * A geolocalização usa para validar e exibir os animais de uma feira.
 */
@Injectable()
export class ConsultarAnimais {
  constructor(private animais: AnimalRepository) {}

  contarDisponiveisDoDono(idDono: string, ids: string[]) {
    return this.animais.contarDisponiveisDoDono(idDono, ids);
  }

  async buscarDisponiveis(ids: string[]): Promise<ResumoDeAnimal[]> {
    const animais = await this.animais.buscarDisponiveisPorIds(ids);
    return animais.map((a) => ({ id: a.id, nome: a.nome, especie: a.especie, idade: a.idade, descricao: a.descricao }));
  }
}
