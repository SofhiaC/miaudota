import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Feira, NovaFeira } from '../domain/feira';
import { FeiraRepository } from '../domain/feira.repository';
import { FeiraDocumento } from './feira.schema';

@Injectable()
export class FeiraMongoRepository implements FeiraRepository {
  constructor(@InjectModel(FeiraDocumento.name, 'geolocalizacao') private model: Model<FeiraDocumento>) {}

  private paraEntidade(d: any): Feira {
    return new Feira(
      String(d._id), d.nome, d.descricao, d.endereco, d.latitude, d.longitude,
      d.dataInicio, d.dataFim, d.id_ong, [...(d.animais ?? [])],
    );
  }

  async criar(n: NovaFeira) {
    const d = await this.model.create({
      nome: n.nome,
      descricao: n.descricao,
      endereco: n.endereco,
      latitude: n.latitude,
      longitude: n.longitude,
      localizacao: { type: 'Point', coordinates: [n.longitude, n.latitude] },
      dataInicio: n.dataInicio,
      dataFim: n.dataFim,
      id_ong: n.idOng,
      animais: n.animais,
    });
    return this.paraEntidade(d);
  }

  async buscarPorId(id: string) {
    const d = await this.model.findById(id);
    return d ? this.paraEntidade(d) : null;
  }

  async salvar(feira: Feira) {
    await this.model.updateOne({ _id: feira.id }, { animais: feira.animais });
  }

  async listarAtivas(agora: Date) {
    const ds = await this.model.find({ dataFim: { $gte: agora } }).sort({ dataInicio: 1 });
    return ds.map((d) => this.paraEntidade(d));
  }

  async listarProximas(lat: number, lng: number, raioKm: number, agora: Date) {
    const filtro: any = {
      dataFim: { $gte: agora },
      localizacao: {
        $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: raioKm * 1000 },
      },
    };
    const ds = await this.model.find(filtro).limit(100); // $near já ordena por distância
    return ds.map((d) => this.paraEntidade(d));
  }

  async excluirDaOng(idOng: string) {
    await this.model.deleteMany({ id_ong: idOng });
  }
}
