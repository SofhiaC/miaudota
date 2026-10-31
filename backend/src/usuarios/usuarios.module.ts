import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmissorDeToken, HashDeSenha } from './application/ports';
import { UsuarioRepository } from './domain/usuario.repository';
import { BcryptHashDeSenha } from './infrastructure/bcrypt-hash-de-senha';
import { JwtEmissorDeToken } from './infrastructure/jwt-emissor-de-token';
import { UsuarioMongoRepository } from './infrastructure/usuario.mongo-repository';
import { UsuarioDocumento, UsuarioSchema } from './infrastructure/usuario.schema';
import { CadastrarUsuario } from './casos-de-uso/cadastrar-usuario/cadastrar-usuario.use-case';
import { CadastrarUsuarioController } from './casos-de-uso/cadastrar-usuario/cadastrar-usuario.controller';
import { LoginUsuario } from './casos-de-uso/login/login.use-case';
import { LoginController } from './casos-de-uso/login/login.controller';
import { ObterPerfil } from './casos-de-uso/obter-perfil/obter-perfil.use-case';
import { ObterPerfilController } from './casos-de-uso/obter-perfil/obter-perfil.controller';
import { ExcluirConta } from './casos-de-uso/excluir-conta/excluir-conta.use-case';
import { ExcluirContaController } from './casos-de-uso/excluir-conta/excluir-conta.controller';
import { ConsultarResumosDeUsuarios } from './casos-de-uso/consultar-resumos/consultar-resumos.use-case';
import { ConsultarResumosController } from './casos-de-uso/consultar-resumos/consultar-resumos.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: UsuarioDocumento.name, schema: UsuarioSchema }], 'usuarios')],
  controllers: [CadastrarUsuarioController, LoginController, ObterPerfilController, ExcluirContaController, ConsultarResumosController],
  providers: [
    CadastrarUsuario, LoginUsuario, ObterPerfil, ExcluirConta, ConsultarResumosDeUsuarios,
    { provide: UsuarioRepository, useClass: UsuarioMongoRepository },
    { provide: HashDeSenha, useClass: BcryptHashDeSenha },
    { provide: EmissorDeToken, useClass: JwtEmissorDeToken },
  ],
})
export class UsuariosModule {}
