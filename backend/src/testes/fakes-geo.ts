import { Feira, NovaFeira } from '../geolocalizacao/domain/feira';
import { FeiraRepository } from '../geolocalizacao/domain/feira.repository';

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

