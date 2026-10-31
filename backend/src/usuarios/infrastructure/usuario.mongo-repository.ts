import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from '../domain/usuario';
import { NovoUsuario, UsuarioRepository } from '../domain/usuario.repository';
import { UsuarioDocumento } from './usuario.schema';

@Injectable()
export class UsuarioMongoRepository implements UsuarioRepository {
  constructor(@InjectModel(UsuarioDocumento.name, 'usuarios') private model: Model<UsuarioDocumento>) {}

  private paraEntidade(d: any): Usuario {
    return new Usuario(String(d._id), d.nome, d.email, d.tipo, d.consentimentoLgpdEm, d.senhaHash);
  }

  async criar(dados: NovoUsuario) {
    return this.paraEntidade(await this.model.create(dados));
  }

  async existePorEmail(email: string) {
    return !!(await this.model.exists({ email }));
  }

  async buscarPorEmailComSenha(email: string) {
    const d = await this.model.findOne({ email }).select('+senhaHash');
    return d ? this.paraEntidade(d) : null;
  }

  async buscarPorId(id: string) {
    const d = await this.model.findById(id);
    return d ? this.paraEntidade(d) : null;
  }

  async buscarPorIds(ids: string[]) {
    const ds = await this.model.find({ _id: { $in: ids } });
    return ds.map((d) => this.paraEntidade(d));
  }

  async excluir(id: string) {
    await this.model.deleteOne({ _id: id });
  }
}
