import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { FeiraRepository } from '../../domain/feira.repository';

export type DadosAtualizacaoFeira = {
  nome?: string;
  descricao?: string;
  endereco?: string;
  latitude?: number;
  longitude?: number;
  dataInicio?: string;
  dataFim?: string;
};

@Injectable()
export class AtualizarFeira {
  constructor(private feiras: FeiraRepository, private montar: MontarVisaoDasFeiras) {}

  async executar(idFeira: string, idOng: string, d: DadosAtualizacaoFeira) {
    const feira = await this.feiras.buscarPorId(idFeira);
    if (!feira) throw new NaoEncontradoError('Feira não encontrada');
    if (!feira.ehDa(idOng)) throw new AcessoNegadoError('Acesso negado'); // só a ONG dona altera

    feira.atualizar({
      ...d,
      dataInicio: d.dataInicio ? new Date(d.dataInicio) : undefined,
      dataFim: d.dataFim ? new Date(d.dataFim) : undefined,
    });
    await this.feiras.salvar(feira);

    return (await this.montar.executar([feira]))[0];
  }
}
