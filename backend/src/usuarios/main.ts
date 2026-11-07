import 'dotenv/config'; // precisa ser o primeiro import
import { iniciarServico } from '../shared/http/iniciar-servico';
import { UsuariosServicoModule } from './usuarios-servico.module';

iniciarServico(UsuariosServicoModule, 'usuarios', Number(process.env.PORTA_USUARIOS || process.env.PORT) || 3101, {
  swagger: {
    titulo: 'Miaudota - Microsserviço de Usuários',
    descricao: 'Cadastro, login (JWT), perfil e exclusão de conta (MongoDB). Chamado pelo BFF; exige a chave interna.',
  },
});
