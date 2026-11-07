import { Animal, NovoAnimal } from '../adocao/domain/animal';
import { AnimalRepository, FavoritoRepository, SolicitacaoRepository } from '../adocao/domain/repositorios';
import { Solicitacao } from '../adocao/domain/solicitacao';
import { UsuarioGateway } from '../adocao/application/usuario.gateway';
import { DONO } from './fakes-comum';

export function novoAnimal(parcial: Partial<Animal> = {}) {
  return Object.assign(new Animal('animal-1', 'Rex', 'cachorro', 3, 'dócil', DONO, true, new Date()), parcial);
}

export class AnimalRepositoryFake extends AnimalRepository {
  itens = new Map<string, Animal>();
  constructor(...iniciais: Animal[]) {
    super();
    iniciais.forEach((a) => this.itens.set(a.id, a));
  }
  async criar(d: NovoAnimal) {
    const a = new Animal(`animal-${this.itens.size + 1}`, d.nome, d.especie, d.idade, d.descricao, d.idDono, true, new Date());
    this.itens.set(a.id, a);
    return a;
  }
  async buscarPorId(id: string) { return this.itens.get(id) ?? null; }
  async buscarPorIds(ids: string[]) { return ids.map((i) => this.itens.get(i)).filter(Boolean) as Animal[]; }
  async listarDisponiveisDeOutros(u: string) { return [...this.itens.values()].filter((a) => a.disponivel && a.idDono !== u); }
  async listarDoDono(d: string) { return [...this.itens.values()].filter((a) => a.idDono === d); }
  async sugerirPorEspecies() { return []; }
  async contarDisponiveisDoDono(d: string, ids: string[]) {
    return ids.filter((i) => { const a = this.itens.get(i); return a && a.idDono === d && a.disponivel; }).length;
  }
  async buscarDisponiveisPorIds(ids: string[]) { return (await this.buscarPorIds(ids)).filter((a) => a.disponivel); }
  async salvar(a: Animal) { this.itens.set(a.id, a); }
  async excluir(id: string) { this.itens.delete(id); }
  async excluirDoDono(d: string) { [...this.itens.values()].filter((a) => a.idDono === d).forEach((a) => this.itens.delete(a.id)); }
}

export class FavoritoRepositoryFake extends FavoritoRepository {
  pares: string[] = [];
  async salvar(adotante: string, animal: string) { if (!this.pares.includes(`${adotante}|${animal}`)) this.pares.push(`${adotante}|${animal}`); }
  async listarDoAdotante() { return []; }
  async remover(adotante: string, animal: string) { this.pares = this.pares.filter((p) => p !== `${adotante}|${animal}`); }
  async removerDoAdotante(adotante: string) { this.pares = this.pares.filter((p) => !p.startsWith(`${adotante}|`)); }
  async removerPorAnimais(ids: string[]) { this.pares = this.pares.filter((p) => !ids.includes(p.split('|')[1])); }
}

export class SolicitacaoRepositoryFake extends SolicitacaoRepository {
  itens = new Map<string, Solicitacao>();
  async criar(adotante: string, animal: string) {
    const s = new Solicitacao(`sol-${this.itens.size + 1}`, adotante, animal, 'PENDENTE', new Date());
    this.itens.set(s.id, s);
    return s;
  }
  async buscarPorId(id: string) { return this.itens.get(id) ?? null; }
  async existePendente(adotante: string, animal: string) {
    return [...this.itens.values()].some((s) => s.idAdotante === adotante && s.idAnimal === animal && s.status === 'PENDENTE');
  }
  async listarDoAdotante(adotante: string) { return [...this.itens.values()].filter((s) => s.idAdotante === adotante); }
  async listarPorAnimais(ids: string[]) { return [...this.itens.values()].filter((s) => ids.includes(s.idAnimal)); }
  async salvar(s: Solicitacao) { this.itens.set(s.id, s); }
  async recusarPendentesDoAnimal(animal: string, exceto: string) {
    this.itens.forEach((s) => { if (s.idAnimal === animal && s.id !== exceto && s.status === 'PENDENTE') s.status = 'RECUSADA'; });
  }
  async removerDoAdotante(adotante: string) { [...this.itens.values()].filter((s) => s.idAdotante === adotante).forEach((s) => this.itens.delete(s.id)); }
  async removerPorAnimais(ids: string[]) { [...this.itens.values()].filter((s) => ids.includes(s.idAnimal)).forEach((s) => this.itens.delete(s.id)); }
}

export class UsuarioGatewayFake extends UsuarioGateway {
  constructor(private falha = false) { super(); }
  async buscarResumos(ids: string[]) {
    if (this.falha) throw new Error('serviço de usuários fora do ar');
    return ids.map((id) => ({ id, nome: `Nome ${id.slice(0, 2)}`, email: `${id.slice(0, 2)}@teste.com` }));
  }
}
