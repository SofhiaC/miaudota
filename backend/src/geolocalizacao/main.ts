import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { GeolocalizacaoServicoModule } from './geolocalizacao-servico.module';

iniciarServico(GeolocalizacaoServicoModule, 'geolocalizacao', Number(process.env.PORTA_GEOLOCALIZACAO) || 3103);
