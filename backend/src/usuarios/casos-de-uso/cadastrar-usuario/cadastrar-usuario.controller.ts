import { Body, Controller, Post } from '@nestjs/common';
import { Equals, IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { CadastrarUsuario } from './cadastrar-usuario.use-case';

export class CadastroDto {
  @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) @MaxLength(72) senha: string;
  @IsIn(['PESSOA', 'ONG']) tipo: 'PESSOA' | 'ONG';
  @Equals(true, { message: 'É necessário consentir com o tratamento de dados pessoais (LGPD)' })
  consentimentoLgpd: boolean;
}

@Controller('usuarios')
export class CadastrarUsuarioController {
  constructor(private caso: CadastrarUsuario) {}

  @Public() @Post()
  async cadastrar(@Body() dto: CadastroDto) {
    const { token, usuario } = await this.caso.executar(dto);
    return { token, usuario: usuarioParaJson(usuario) };
  }
}
