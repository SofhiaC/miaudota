import { Injectable } from '@nestjs/common';
import { urlServico } from '../../shared/config';
import { ServicoIndisponivelError } from '../../shared/errors';
import { chamarServico } from '../../shared/http/chamar-servico';
import { AnimaisGateway } from '../application/animais.gateway';

/** Adaptador HTTP: consulta o serviço de adoção pela rota interna. */
@Injectable()
export class AnimaisGatewayHttp implements AnimaisGateway {
  async contarDisponiveisDoDono(idDono: string, ids: string[]): Promise<number> {
    const r = await chamarServico({
      url: `${urlServico('adocao')}/internos/animais/contagem-do-dono`,
      metodo: 'POST',
      corpo: { dono: idDono, ids },
    });
    if (r.status !== 200 || typeof r.corpo?.total !== 'number') {
      throw new ServicoIndisponivelError('Não foi possível validar os animais agora');
    }
    return r.corpo.total;
  }
}
