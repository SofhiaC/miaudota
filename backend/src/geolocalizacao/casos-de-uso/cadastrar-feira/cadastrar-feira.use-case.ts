import { Injectable } from '@nestjs/common';
import { EventPublisher, Eventos } from '../../../shared/events/eventos';
import { AnimaisGateway } from '../../application/animais.gateway';
import { ResumoUsuario, UsuarioGateway } from '../../application/usuario.gateway';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { validarAnimaisDaOng } from '../../application/validar-animais-da-ong';
import { Feira } from '../../domain/feira';
import { FeiraRepository } from '../../domain/feira.repository';

export type DadosNovaFeira = {
  idOng: string;
  nome: string;
  descricao?: string;
  endereco: string;
  latitude: number;
  longitude: number;
  dataInicio: string;
  dataFim: string;
  animais?: string[];
};

@Injectable()
export class CadastrarFeira {
  constructor(
    private feiras: FeiraRepository,
    private animais: AnimaisGateway,
    private montar: MontarVisaoDasFeiras,
    private eventos: EventPublisher,
    private usuarios: UsuarioGateway,
  ) {}

  async executar(d: DadosNovaFeira) {
    const inicio = new Date(d.dataInicio);
    const fim = new Date(d.dataFim);
    Feira.validarPeriodo(inicio, fim);
    const animais = await validarAnimaisDaOng(this.animais, d.idOng, d.animais);

    const feira = await this.feiras.criar({
      nome: d.nome, descricao: d.descricao, endereco: d.endereco,
      latitude: d.latitude, longitude: d.longitude,
      dataInicio: inicio, dataFim: fim, idOng: d.idOng, animais,
    });

    // o evento já leva o que o e-mail precisa; sem o serviço de usuários a feira é criada do mesmo jeito, só sem e-mail
    const [ong]: ResumoUsuario[] = await this.usuarios.buscarResumos([feira.idOng]).catch(() => []);
    await this.eventos.publicar(Eventos.FeiraCadastrada, {
      feiraId: feira.id,
      nome: feira.nome,
      endereco: feira.endereco,
      dataInicio: feira.dataInicio.toISOString(),
      dataFim: feira.dataFim.toISOString(),
      idOng: feira.idOng,
      ongNome: ong?.nome,
      destinatarioEmail: ong?.email,
    });

    return (await this.montar.executar([feira]))[0];
  }
}
