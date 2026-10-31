import { Injectable } from '@nestjs/common';
import { NaoEncontradoError } from '../../../shared/errors';
import { UsuarioRepository } from '../../domain/usuario.repository';

@Injectable()
export class ObterPerfil {
  constructor(private usuarios: UsuarioRepository) {}

  async executar(id: string) {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new NaoEncontradoError('Usuário não encontrado');
    return usuario;
  }
}
