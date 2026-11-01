import { SolicitacaoDetalhada } from '../application/detalhar-solicitacoes';
import { Animal } from '../domain/animal';

export const animalParaJson = (a: Animal) => ({
  _id: a.id,
  nome: a.nome,
  especie: a.especie,
  idade: a.idade,
  descricao: a.descricao,
  id_dono: a.idDono,
  disponivel: a.disponivel,
  createdAt: a.criadoEm,
});

export const solicitacaoParaJson = (d: SolicitacaoDetalhada) => ({
  _id: d.solicitacao.id,
  status: d.solicitacao.status,
  id_animal: d.solicitacao.idAnimal,
  animalNome: d.animalNome,
  animal: d.animal
    ? { nome: d.animal.nome, especie: d.animal.especie, idade: d.animal.idade, descricao: d.animal.descricao }
    : undefined,
  adotante: d.adotante,
  createdAt: d.solicitacao.criadoEm,
});
