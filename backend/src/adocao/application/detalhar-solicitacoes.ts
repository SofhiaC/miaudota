import { Injectable } from '@nestjs/common';
import { Animal } from '../domain/animal';
import { Solicitacao } from '../domain/solicitacao';
import { AnimalRepository } from '../domain/repositorios';
import { ResumoUsuario, UsuarioGateway } from './usuario.gateway';

export type SolicitacaoDetalhada = {
  solicitacao: Solicitacao;
  animalNome?: string;
  animal?: Animal;
  adotante?: { nome: string; email: string };
};

/** Junta nome do animal e (para quem recebe) os dados de contato do adotante. */
@Injectable()
export class DetalharSolicitacoes {
  constructor(private animais: AnimalRepository, private usuarios: UsuarioGateway) {}

  async executar(solicitacoes: Solicitacao[], incluirAdotante: boolean): Promise<SolicitacaoDetalhada[]> {
    if (!solicitacoes.length) return [];

    const animais = await this.animais.buscarPorIds([...new Set(solicitacoes.map((s) => s.idAnimal))]);
    const porId = new Map(animais.map((a) => [a.id, a]));

    const adotantes = new Map<string, { nome: string; email: string }>();
    if (incluirAdotante) {
      // sem o serviço de usuários a lista continua útil, só não mostra o contato do adotante
      const resumos: ResumoUsuario[] = await this.usuarios
        .buscarResumos(solicitacoes.map((s) => s.idAdotante))
        .catch(() => []);
      resumos.forEach((u) => adotantes.set(u.id, { nome: u.nome, email: u.email }));
    }

    return solicitacoes.map((s) => ({
      solicitacao: s,
      animalNome: porId.get(s.idAnimal)?.nome,
      animal: porId.get(s.idAnimal),
      adotante: adotantes.get(s.idAdotante),
    }));
  }
}
