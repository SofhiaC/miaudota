import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, ConflitoError, NaoEncontradoError } from '../../../shared/errors';
import { EventPublisher, Eventos } from '../../../shared/events/eventos';
import { ResumoUsuario, UsuarioGateway } from '../../application/usuario.gateway';
import { AnimalRepository, SolicitacaoRepository } from '../../domain/repositorios';

@Injectable()
export class SolicitarAdocao {
  constructor(
    private animais: AnimalRepository,
    private solicitacoes: SolicitacaoRepository,
    private usuarios: UsuarioGateway,
    private eventos: EventPublisher,
  ) {}

  async executar(idAdotante: string, idAnimal: string) {
    const animal = await this.animais.buscarPorId(idAnimal);
    if (!animal) throw new NaoEncontradoError('Animal não encontrado');
    if (animal.ehDe(idAdotante)) throw new AcessoNegadoError('Você não pode solicitar a adoção de um animal seu');
    if (!animal.disponivel) throw new ConflitoError('Este animal não está mais disponível para adoção');
    if (await this.solicitacoes.existePendente(idAdotante, idAnimal)) {
      throw new ConflitoError('Você já tem uma solicitação pendente para este animal');
    }

    const solicitacao = await this.solicitacoes.criar(idAdotante, idAnimal);

    // o evento já leva o que o e-mail precisa (destinatário e conteúdo), como pede a decisão 9.8
    // se o serviço de usuários estiver fora do ar, a solicitação continua valendo; só o e-mail perde os detalhes
    const resumos: ResumoUsuario[] = await this.usuarios.buscarResumos([animal.idDono, idAdotante]).catch(() => []);
    await this.eventos.publicar(Eventos.SolicitacaoAdocaoCriada, {
      solicitacaoId: solicitacao.id,
      animalId: animal.id,
      animalNome: animal.nome,
      destinatarioEmail: resumos.find((r) => r.id === animal.idDono)?.email,
      adotanteNome: resumos.find((r) => r.id === idAdotante)?.nome,
    });

    return solicitacao;
  }
}
