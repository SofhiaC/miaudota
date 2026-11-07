import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Animal, NovoAnimal } from '../domain/animal';
import { AnimalRepository } from '../domain/repositorios';
import { AnimalDocumento } from './schemas';

@Injectable()
export class AnimalMongoRepository implements AnimalRepository {
  constructor(@InjectModel(AnimalDocumento.name, 'adocao') private model: Model<AnimalDocumento>) {}

  private paraEntidade(d: any): Animal {
    return new Animal(String(d._id), d.nome, d.especie, d.idade, d.descricao, d.id_dono, d.disponivel, d.createdAt);
  }

  private paraEntidades(ds: any[]): Animal[] {
    return ds.map((d) => this.paraEntidade(d));
  }

  async criar(n: NovoAnimal) {
    const d = await this.model.create({
      nome: n.nome, especie: n.especie, idade: n.idade, descricao: n.descricao, id_dono: n.idDono,
    });
    return this.paraEntidade(d);
  }

  async buscarPorId(id: string) {
    const d = await this.model.findById(id);
    return d ? this.paraEntidade(d) : null;
  }

  async buscarPorIds(ids: string[]) {
    if (!ids.length) return [];
    return this.paraEntidades(await this.model.find({ _id: { $in: ids } }));
  }

  async listarDisponiveisDeOutros(idUsuario: string) {
    return this.paraEntidades(
      await this.model.find({ disponivel: true, id_dono: { $ne: idUsuario } }).sort({ createdAt: -1 }),
    );
  }

  async listarDoDono(idDono: string) {
    return this.paraEntidades(await this.model.find({ id_dono: idDono }).sort({ createdAt: -1 }));
  }

  async sugerirPorEspecies(especies: string[], idUsuario: string, excetoIds: string[]) {
    if (!especies.length) return [];
    return this.paraEntidades(
      await this.model.find({
        disponivel: true,
        id_dono: { $ne: idUsuario },
        _id: { $nin: excetoIds },
        especie: { $in: especies },
      }),
    );
  }

  async contarDisponiveisDoDono(idDono: string, ids: string[]) {
    return this.model.countDocuments({ _id: { $in: ids }, id_dono: idDono, disponivel: true });
  }

  async buscarDisponiveisPorIds(ids: string[]) {
    if (!ids.length) return [];
    return this.paraEntidades(await this.model.find({ _id: { $in: ids }, disponivel: true }));
  }

  async salvar(animal: Animal) {
    await this.model.updateOne(
      { _id: animal.id },
      { nome: animal.nome, especie: animal.especie, idade: animal.idade, descricao: animal.descricao, disponivel: animal.disponivel },
    );
  }

  async excluir(id: string) {
    await this.model.deleteOne({ _id: id });
  }

  async excluirDoDono(idDono: string) {
    await this.model.deleteMany({ id_dono: idDono });
  }
}
