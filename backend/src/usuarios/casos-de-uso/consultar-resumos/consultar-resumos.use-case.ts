import { Injectable } from '@nestjs/common';
import { UsuarioRepository } from '../../domain/usuario.repository';

export type ResumoDeUsuario = { id: string; nome: string; email: string };

/**
 * API pública do módulo para os outros módulos (sem rota HTTP).
 * Quando virar microsserviço, quem consome troca o adaptador local por um cliente HTTP.
 */
@Injectable()
export class ConsultarResumosDeUsuarios {
  constructor(private usuarios: UsuarioRepository) {}

  async executar(ids: string[]): Promise<ResumoDeUsuario[]> {
    const unicos = [...new Set(ids)];
    if (!unicos.length) return [];
    const usuarios = await this.usuarios.buscarPorIds(unicos);
    return usuarios.map((u) => ({ id: u.id, nome: u.nome, email: u.email }));
  }
}
