import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Equals, IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { Public } from '../../../shared/auth/auth';
import { usuarioParaJson } from '../../presentation/usuario.presenter';
import { CadastrarUsuario } from './cadastrar-usuario.use-case';

export class CadastroDto {
  @ApiProperty({ example: 'ONG Patas Felizes' }) @IsString() @MinLength(2) @MaxLength(100) nome: string;
  @ApiProperty({ example: 'contato@ong.org' }) @IsEmail() email: string;
  @ApiProperty({ example: 'senha-forte-123', minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72) senha: string;
  @ApiProperty({ enum: ['PESSOA', 'ONG'] }) @IsIn(['PESSOA', 'ONG']) tipo: 'PESSOA' | 'ONG';
  @ApiProperty({ example: true, description: 'Precisa ser true (LGPD)' })
  @Equals(true, { message: 'É necessário consentir com o tratamento de dados pessoais (LGPD)' })
  consentimentoLgpd: boolean;
}

@ApiTags('usuarios')
@ApiSecurity('chave-interna')
@Controller('usuarios')
export class CadastrarUsuarioController {
  constructor(private caso: CadastrarUsuario) {}

  @ApiOperation({ summary: 'Cadastra um usuário (PESSOA ou ONG) com consentimento LGPD' })
  @Public() @Post()
  async cadastrar(@Body() dto: CadastroDto) {
    const { token, usuario } = await this.caso.executar(dto);
    return { token, usuario: usuarioParaJson(usuario) };
  }
}
