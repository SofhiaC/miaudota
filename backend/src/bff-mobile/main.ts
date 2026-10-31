import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { BffMobileModule } from './bff-mobile.module';

iniciarServico(BffMobileModule, 'bff-mobile', Number(process.env.PORTA_BFF) || 3001);
