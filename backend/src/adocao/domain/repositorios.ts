import { Animal, NovoAnimal } from './animal';
import { Favorito } from './favorito';
import { Solicitacao } from './solicitacao';

/** Portas de saída do módulo de adoção. Os adaptadores (MongoDB) ficam em infrastructure. */
export abstract class AnimalRepository {
  abstract criar(dados: NovoAnimal): Promise<Animal>;
  abstract buscarPorId(id: string): Promise<Animal | null>;
  abstract buscarPorIds(ids: string[]): Promise<Animal[]>;
  abstract listarDisponiveisDeOutros(idUsuario: string): Promise<Animal[]>;
  abstract listarDoDono(idDono: string): Promise<Animal[]>;
  abstract sugerirPorEspecies(especies: string[], idUsuario: string, excetoIds: string[]): Promise<Animal[]>;
  abstract contarDisponiveisDoDono(idDono: string, ids: string[]): Promise<number>;
  abstract buscarDisponiveisPorIds(ids: string[]): Promise<Animal[]>;
  /** Grava os dados do animal e se ele está disponível (atualização completa). */
  abstract salvar(animal: Animal): Promise<void>;
  abstract excluir(id: string): Promise<void>;
  abstract excluirDoDono(idDono: string): Promise<void>;
}

export abstract class FavoritoRepository {
  abstract salvar(idAdotante: string, idAnimal: string): Promise<void>;
  abstract listarDoAdotante(idAdotante: string): Promise<Favorito[]>;
  abstract remover(idAdotante: string, idAnimal: string): Promise<void>;
  abstract removerDoAdotante(idAdotante: string): Promise<void>;
  abstract removerPorAnimais(idsAnimais: string[]): Promise<void>;
}

export abstract class SolicitacaoRepository {
  abstract criar(idAdotante: string, idAnimal: string): Promise<Solicitacao>;
  abstract buscarPorId(id: string): Promise<Solicitacao | null>;
  abstract existePendente(idAdotante: string, idAnimal: string): Promise<boolean>;
  abstract listarDoAdotante(idAdotante: string): Promise<Solicitacao[]>;
  abstract listarPorAnimais(idsAnimais: string[]): Promise<Solicitacao[]>;
  abstract salvar(solicitacao: Solicitacao): Promise<void>;
  abstract recusarPendentesDoAnimal(idAnimal: string, exceto: string): Promise<void>;
  abstract removerDoAdotante(idAdotante: string): Promise<void>;
  abstract removerPorAnimais(idsAnimais: string[]): Promise<void>;
}
