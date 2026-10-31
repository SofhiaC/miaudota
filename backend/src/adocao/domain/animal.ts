export class Animal {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly especie: string,
    public readonly idade: number,
    public readonly descricao: string | undefined,
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
}

export type NovoAnimal = { nome: string; especie: string; idade: number; descricao?: string; idDono: string };
