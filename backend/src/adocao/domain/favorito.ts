export class Favorito {
  constructor(
    public readonly id: string,
    public readonly idAdotante: string,
    public readonly idAnimal: string,
    public readonly criadoEm: Date,
  ) {}
}
