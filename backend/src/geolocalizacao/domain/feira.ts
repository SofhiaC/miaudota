import { RegraDeNegocioError } from '../../shared/errors';

export class Feira {
  constructor(
    public readonly id: string,
    public nome: string,
    public descricao: string | undefined,
    public endereco: string,
    public latitude: number,
    public longitude: number,
    public dataInicio: Date,
    public dataFim: Date,
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

  /** Atualiza os dados da feira (a ONG dona e os animais têm operações próprias). */
  atualizar(d: DadosEditaveisDaFeira, agora = new Date()) {
    const inicio = d.dataInicio ?? this.dataInicio;
    const fim = d.dataFim ?? this.dataFim;
    Feira.validarPeriodo(inicio, fim, agora);
    this.nome = d.nome ?? this.nome;
    this.descricao = d.descricao ?? this.descricao;
    this.endereco = d.endereco ?? this.endereco;
    this.latitude = d.latitude ?? this.latitude;
    this.longitude = d.longitude ?? this.longitude;
    this.dataInicio = inicio;
    this.dataFim = fim;
  }
}

export type DadosEditaveisDaFeira = Partial<{
  nome: string;
  descricao: string;
  endereco: string;
  latitude: number;
  longitude: number;
  dataInicio: Date;
  dataFim: Date;
}>;

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
