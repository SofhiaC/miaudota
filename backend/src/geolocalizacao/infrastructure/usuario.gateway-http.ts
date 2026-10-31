import { Injectable } from '@nestjs/common';
import { urlServico } from '../../shared/config';
import { ServicoIndisponivelError } from '../../shared/errors';
import { chamarServico } from '../../shared/http/chamar-servico';
import { ResumoUsuario, UsuarioGateway } from '../application/usuario.gateway';

/** Adaptador HTTP: consulta o serviço de usuários pela rota interna. */
@Injectable()
export class UsuarioGatewayHttp implements UsuarioGateway {
  async buscarResumos(ids: string[]): Promise<ResumoUsuario[]> {
    const unicos = [...new Set(ids)];
    if (!unicos.length) return [];
    const r = await chamarServico({
      url: `${urlServico('usuarios')}/internos/usuarios/resumos`,
      metodo: 'POST',
      corpo: { ids: unicos },
    });
    if (r.status !== 200 || !Array.isArray(r.corpo)) {
      throw new ServicoIndisponivelError('Não foi possível consultar usuários agora');
    }
    return r.corpo;
  }
}
