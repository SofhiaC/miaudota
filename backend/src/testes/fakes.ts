import { Animal, NovoAnimal } from '../adocao/domain/animal';
import { AnimalRepository, FavoritoRepository, SolicitacaoRepository } from '../adocao/domain/repositorios';
import { Solicitacao } from '../adocao/domain/solicitacao';
import { UsuarioGateway } from '../adocao/application/usuario.gateway';
import { EventPublisher, NomeEvento } from '../shared/events/eventos';
import { Feira, NovaFeira } from '../geolocalizacao/domain/feira';
import { FeiraRepository } from '../geolocalizacao/domain/feira.repository';

/** Dublês em memória das portas. Servem para testar regras de negócio sem MongoDB, SQL ou RabbitMQ. */

export const DONO = 'aaaaaaaaaaaaaaaaaaaaaaaa';
export const ADOTANTE = 'bbbbbbbbbbbbbbbbbbbbbbbb';
export const OUTRO = 'cccccccccccccccccccccccc';

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

export class EventPublisherFake extends EventPublisher {
  publicados: { nome: NomeEvento; dados: Record<string, unknown> }[] = [];
  async publicar(nome: NomeEvento, dados: Record<string, unknown>) { this.publicados.push({ nome, dados }); }
}

export class FeiraRepositoryFake extends FeiraRepository {
  itens = new Map<string, Feira>();
  async criar(d: NovaFeira) {
    const f = new Feira(`feira-${this.itens.size + 1}`, d.nome, d.descricao, d.endereco, d.latitude, d.longitude, d.dataInicio, d.dataFim, d.idOng, d.animais);
    this.itens.set(f.id, f);
    return f;
  }
  async buscarPorId(id: string) { return this.itens.get(id) ?? null; }
  async salvar(f: Feira) { this.itens.set(f.id, f); }
  async excluir(id: string) { this.itens.delete(id); }
  async listarAtivas() { return [...this.itens.values()]; }
  async listarProximas() { return [...this.itens.values()]; }
  async excluirDaOng(ong: string) { [...this.itens.values()].filter((f) => f.idOng === ong).forEach((f) => this.itens.delete(f.id)); }
}

export const emDias = (n: number) => new Date(Date.now() + n * 86_400_000);
