import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { LoginUsuario } from './login.use-case';

export class LoginDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() senha: string;
}

@Controller('usuarios')
export class LoginController {
  constructor(private caso: LoginUsuario) {}

  @Public() @Post('login') @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const { token, usuario } = await this.caso.executar(dto.email, dto.senha);
    return { token, usuario: usuarioParaJson(usuario) };
  }
}
