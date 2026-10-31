import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { AdocaoServicoModule } from './adocao-servico.module';

iniciarServico(AdocaoServicoModule, 'adocao', Number(process.env.PORTA_ADOCAO) || 3102);
