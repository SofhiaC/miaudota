import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { UsuariosServicoModule } from './usuarios-servico.module';

iniciarServico(UsuariosServicoModule, 'usuarios', Number(process.env.PORTA_USUARIOS) || 3101);
