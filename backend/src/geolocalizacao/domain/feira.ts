import { RegraDeNegocioError } from '../../shared/errors';

export class Feira {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly descricao: string | undefined,
    public readonly endereco: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly dataInicio: Date,
    public readonly dataFim: Date,
    public readonly idOng: string,
    public animais: string[], // ids dos animais (referência lógica ao serviço de adoção)
  ) {}

  /** Regras do período: fim depois do início e feira que ainda não terminou. */
  static validarPeriodo(inicio: Date, fim: Date, agora = new Date()) {
    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) throw new RegraDeNegocioError('Datas inválidas');
    if (fim <= inicio) throw new RegraDeNegocioError('dataFim deve ser posterior a dataInicio');
    if (fim < agora) throw new RegraDeNegocioError('A feira não pode terminar no passado');
  }

  acontecendoAgora(agora = new Date()) {
    return this.dataInicio <= agora && this.dataFim >= agora;
  }

  ehDa(idOng: string) {
    return this.idOng === idOng;
  }

  definirAnimais(ids: string[]) {
    this.animais = [...new Set(ids)];
  }
}

export type NovaFeira = {
  nome: string;
  descricao?: string;
  endereco: string;
  latitude: number;
  longitude: number;
  dataInicio: Date;
  dataFim: Date;
  idOng: string;
  animais: string[];
};
