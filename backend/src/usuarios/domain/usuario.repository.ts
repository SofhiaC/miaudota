import { TipoUsuario, Usuario } from './usuario';

export type NovoUsuario = {
  nome: string;
  email: string;
  senhaHash: string;
  tipo: TipoUsuario;
  consentimentoLgpdEm: Date;
};

/** Porta de saída: o domínio só conhece este contrato, não o MongoDB. */
export abstract class UsuarioRepository {
  abstract criar(dados: NovoUsuario): Promise<Usuario>;
  abstract existePorEmail(email: string): Promise<boolean>;
  abstract buscarPorEmailComSenha(email: string): Promise<Usuario | null>;
  abstract buscarPorId(id: string): Promise<Usuario | null>;
  abstract buscarPorIds(ids: string[]): Promise<Usuario[]>;
  abstract excluir(id: string): Promise<void>;
}
