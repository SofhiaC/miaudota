import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { LoginUsuario } from './login.use-case';

export class LoginDto {
  @ApiProperty({ example: 'contato@ong.org' }) @IsEmail() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() senha: string;
}

@ApiTags('usuarios')
@ApiSecurity('chave-interna')
@Controller('usuarios')
export class LoginController {
  constructor(private caso: LoginUsuario) {}

  @ApiOperation({ summary: 'Autentica o usuário e devolve o JWT' })
  @Public() @Post('login') @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    const { token, usuario } = await this.caso.executar(dto.email, dto.senha);
    return { token, usuario: usuarioParaJson(usuario) };
  }
}
