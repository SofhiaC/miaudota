export type TipoUsuario = 'PESSOA' | 'ONG';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly email: string,
    public readonly tipo: TipoUsuario,
    public readonly consentimentoLgpdEm: Date,
    public readonly senhaHash?: string, // só vem preenchido quando o repositório carrega para login
  ) {}
}
