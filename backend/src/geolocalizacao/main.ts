import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { GeolocalizacaoServicoModule } from './geolocalizacao-servico.module';

iniciarServico(
  GeolocalizacaoServicoModule,
  'geolocalizacao',
  Number(process.env.PORTA_GEOLOCALIZACAO || process.env.PORT) || 3103,
  {
    swagger: {
      titulo: 'Miaudota - Microsserviço de Geolocalização',
      descricao: 'Feiras de adoção (Azure SQL). Chamado pelo BFF; exige a chave interna.',
    },
  },
);
