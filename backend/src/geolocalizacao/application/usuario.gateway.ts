export type ResumoUsuario = { id: string; nome: string; email: string };

/** Porta para consultar o serviço de usuários (usada para o evento FeiraCadastrada levar o e-mail da ONG). */
export abstract class UsuarioGateway {
  abstract buscarResumos(ids: string[]): Promise<ResumoUsuario[]>;
}
