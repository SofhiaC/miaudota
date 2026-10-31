export abstract class HashDeSenha {
  abstract gerar(senha: string): Promise<string>;
  abstract conferir(senha: string, hash: string): Promise<boolean>;
}

export abstract class EmissorDeToken {
  abstract emitir(usuarioId: string, tipo: string): string;
}
