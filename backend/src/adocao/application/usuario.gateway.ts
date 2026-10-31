export type ResumoUsuario = { id: string; nome: string; email: string };

/**
 * Porta para falar com o domínio de usuários. Hoje o adaptador chama o módulo em memória;
 * quando o serviço de usuário for separado, vira um cliente HTTP, sem mexer nos casos de uso.
 */
export abstract class UsuarioGateway {
  abstract buscarResumos(ids: string[]): Promise<ResumoUsuario[]>;
}
