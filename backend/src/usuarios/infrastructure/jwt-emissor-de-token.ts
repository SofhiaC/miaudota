import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmissorDeToken } from '../application/ports';

@Injectable()
export class JwtEmissorDeToken implements EmissorDeToken {
  constructor(private jwt: JwtService) {}

  emitir(usuarioId: string, tipo: string) {
    return this.jwt.sign({ sub: usuarioId, tipo });
  }
}
