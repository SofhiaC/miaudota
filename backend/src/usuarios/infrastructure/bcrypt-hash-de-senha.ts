import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashDeSenha } from '../application/ports';

@Injectable()
export class BcryptHashDeSenha implements HashDeSenha {
  gerar(senha: string) {
    return bcrypt.hash(senha, 10);
  }
  conferir(senha: string, hash: string) {
    return bcrypt.compare(senha, hash);
  }
}
