import { Injectable } from '@nestjs/common';
import { NaoAutenticadoError } from '../../../shared/errors';
import { EmissorDeToken, HashDeSenha } from '../../application/ports';
import { UsuarioRepository } from '../../domain/usuario.repository';

@Injectable()
export class LoginUsuario {
  constructor(private usuarios: UsuarioRepository, private hash: HashDeSenha, private token: EmissorDeToken) {}

  async executar(email: string, senha: string) {
    const usuario = await this.usuarios.buscarPorEmailComSenha(email.toLowerCase().trim());
    // mesma mensagem para e-mail inexistente e senha errada
    if (!usuario || !(await this.hash.conferir(senha, usuario.senhaHash))) {
      throw new NaoAutenticadoError('E-mail ou senha inválidos');
    }
    return { token: this.token.emitir(usuario.id, usuario.tipo), usuario };
  }
}
