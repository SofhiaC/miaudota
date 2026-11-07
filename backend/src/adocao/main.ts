import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { AdocaoServicoModule } from './adocao-servico.module';

iniciarServico(AdocaoServicoModule, 'adocao', Number(process.env.PORTA_ADOCAO || process.env.PORT) || 3102, {
  swagger: {
    titulo: 'Miaudota - Microsserviço de Adoção',
    descricao: 'Animais, favoritos e solicitações de adoção (MongoDB). Chamado pelo BFF; exige a chave interna.',
  },
});
