import { Injectable } from '@nestjs/common';
import { ConflitoError } from '../../../shared/errors';
import { EventPublisher, Eventos } from '../../../shared/events/eventos';
import { EmissorDeToken, HashDeSenha } from '../../application/ports';
import { TipoUsuario } from '../../domain/usuario';
import { UsuarioRepository } from '../../domain/usuario.repository';

@Injectable()
export class CadastrarUsuario {
  constructor(
    private usuarios: UsuarioRepository,
    private hash: HashDeSenha,
    private token: EmissorDeToken,
    private eventos: EventPublisher,
  ) {}

  async executar(dados: { nome: string; email: string; senha: string; tipo: TipoUsuario }) {
    const email = dados.email.toLowerCase().trim();
    if (await this.usuarios.existePorEmail(email)) throw new ConflitoError('E-mail já cadastrado');

    const usuario = await this.usuarios.criar({
      nome: dados.nome.trim(),
      email,
      senhaHash: await this.hash.gerar(dados.senha),
      tipo: dados.tipo,
      consentimentoLgpdEm: new Date(),
    });

    // o e-mail de boas-vindas é efeito colateral: não atrasa nem derruba o cadastro
    await this.eventos.publicar(Eventos.UsuarioCadastrado, {
      usuarioId: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo,
    });

    return { token: this.token.emitir(usuario.id, usuario.tipo), usuario };
  }
}
