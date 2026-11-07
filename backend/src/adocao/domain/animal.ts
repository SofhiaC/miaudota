import { RegraDeNegocioError } from '../../shared/errors';

export class Animal {
  constructor(
    public readonly id: string,
    public nome: string,
    public especie: string,
    public idade: number,
    public descricao: string | undefined,
    public readonly idDono: string, // referência lógica ao usuário (PESSOA ou ONG)
    public disponivel: boolean,
    public readonly criadoEm: Date,
  ) {}

  ehDe(idUsuario: string) {
    return this.idDono === idUsuario;
  }

  marcarComoAdotado() {
    this.disponivel = false;
  }

  get adotado() {
    return !this.disponivel;
  }

  /** Atualiza os dados do animal. Animal já adotado fica congelado (preserva o histórico da adoção). */
  atualizar(d: DadosEditaveisDoAnimal) {
    if (this.adotado) throw new RegraDeNegocioError('Animal já adotado não pode ser alterado');
    this.nome = d.nome?.trim() ?? this.nome;
    this.especie = d.especie?.trim().toLowerCase() ?? this.especie; // o banco também guarda em minúsculas
    this.idade = d.idade ?? this.idade;
    this.descricao = d.descricao?.trim() ?? this.descricao;
  }
}

export type DadosEditaveisDoAnimal = Partial<{ nome: string; especie: string; idade: number; descricao: string }>;

export type NovoAnimal = { nome: string; especie: string; idade: number; descricao?: string; idDono: string };
