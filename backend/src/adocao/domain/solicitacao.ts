import { ConflitoError } from '../../shared/errors';

export type StatusSolicitacao = 'PENDENTE' | 'APROVADA' | 'RECUSADA';

export class Solicitacao {
  constructor(
    public readonly id: string,
    public readonly idAdotante: string,
    public readonly idAnimal: string,
    public status: StatusSolicitacao,
    public readonly criadoEm: Date,
  ) {}

  /** Regra: só dá para responder uma solicitação que ainda está pendente. */
  responder(status: 'APROVADA' | 'RECUSADA') {
    if (this.status !== 'PENDENTE') throw new ConflitoError('Esta solicitação já foi respondida');
    this.status = status;
  }
}
