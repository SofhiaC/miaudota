import { Injectable } from '@nestjs/common';
import { AcessoNegadoError, NaoEncontradoError } from '../../../shared/errors';
import { DadosEditaveisDoAnimal } from '../../domain/animal';
import { AnimalRepository } from '../../domain/repositorios';

@Injectable()
export class AtualizarAnimal {
  constructor(private animais: AnimalRepository) {}

  async executar(idAnimal: string, idUsuario: string, dados: DadosEditaveisDoAnimal) {
    const animal = await this.animais.buscarPorId(idAnimal);
    if (!animal) throw new NaoEncontradoError('Animal não encontrado');
    if (!animal.ehDe(idUsuario)) throw new AcessoNegadoError('Acesso negado'); // só o dono altera

    animal.atualizar(dados);
    await this.animais.salvar(animal);
    return animal;
  }
}
