import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorito } from '../domain/favorito';
import { FavoritoRepository } from '../domain/repositorios';
import { FavoritoDocumento } from './schemas';

@Injectable()
export class FavoritoMongoRepository implements FavoritoRepository {
  constructor(@InjectModel(FavoritoDocumento.name, 'adocao') private model: Model<FavoritoDocumento>) {}

  async salvar(idAdotante: string, idAnimal: string) {
    await this.model.updateOne(
      { id_adotante: idAdotante, id_animal: idAnimal },
      { id_adotante: idAdotante, id_animal: idAnimal },
      { upsert: true },
    );
  }

  async listarDoAdotante(idAdotante: string) {
    const ds = await this.model.find({ id_adotante: idAdotante }).sort({ createdAt: -1 });
    return ds.map((d: any) => new Favorito(String(d._id), d.id_adotante, d.id_animal, d.createdAt));
  }

  async remover(idAdotante: string, idAnimal: string) {
    await this.model.deleteOne({ id_adotante: idAdotante, id_animal: idAnimal });
  }

  async removerDoAdotante(idAdotante: string) {
    await this.model.deleteMany({ id_adotante: idAdotante });
  }

  async removerPorAnimais(idsAnimais: string[]) {
    if (!idsAnimais.length) return;
    await this.model.deleteMany({ id_animal: { $in: idsAnimais } });
  }
}
