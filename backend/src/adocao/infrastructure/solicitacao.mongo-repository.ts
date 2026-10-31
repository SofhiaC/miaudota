import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SolicitacaoRepository } from '../domain/repositorios';
import { Solicitacao } from '../domain/solicitacao';
import { SolicitacaoDocumento } from './schemas';

@Injectable()
export class SolicitacaoMongoRepository implements SolicitacaoRepository {
  constructor(@InjectModel(SolicitacaoDocumento.name, 'adocao') private model: Model<SolicitacaoDocumento>) {}

  private paraEntidade(d: any): Solicitacao {
    return new Solicitacao(String(d._id), d.id_adotante, d.id_animal, d.status, d.createdAt);
  }

  async criar(idAdotante: string, idAnimal: string) {
    return this.paraEntidade(await this.model.create({ id_adotante: idAdotante, id_animal: idAnimal }));
  }

  async buscarPorId(id: string) {
    const d = await this.model.findById(id);
    return d ? this.paraEntidade(d) : null;
  }

  async existePendente(idAdotante: string, idAnimal: string) {
    return !!(await this.model.exists({ id_adotante: idAdotante, id_animal: idAnimal, status: 'PENDENTE' }));
  }

  async listarDoAdotante(idAdotante: string) {
    const ds = await this.model.find({ id_adotante: idAdotante }).sort({ createdAt: -1 });
    return ds.map((d) => this.paraEntidade(d));
  }

  async listarPorAnimais(idsAnimais: string[]) {
    if (!idsAnimais.length) return [];
    const ds = await this.model.find({ id_animal: { $in: idsAnimais } }).sort({ createdAt: -1 });
    return ds.map((d) => this.paraEntidade(d));
  }

  async salvar(solicitacao: Solicitacao) {
    await this.model.updateOne({ _id: solicitacao.id }, { status: solicitacao.status });
  }

  async recusarPendentesDoAnimal(idAnimal: string, exceto: string) {
    await this.model.updateMany(
      { id_animal: idAnimal, _id: { $ne: exceto }, status: 'PENDENTE' },
      { status: 'RECUSADA' },
    );
  }

  async removerDoAdotante(idAdotante: string) {
    await this.model.deleteMany({ id_adotante: idAdotante });
  }

  async removerPorAnimais(idsAnimais: string[]) {
    if (!idsAnimais.length) return;
    await this.model.deleteMany({ id_animal: { $in: idsAnimais } });
  }
}
