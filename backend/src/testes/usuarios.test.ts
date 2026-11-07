import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { ConflitoError, NaoAutenticadoError } from '../shared/errors';
import { Eventos } from '../shared/events/eventos';
import { CadastrarUsuario } from '../usuarios/casos-de-uso/cadastrar-usuario/cadastrar-usuario.use-case';
import { LoginUsuario } from '../usuarios/casos-de-uso/login/login.use-case';
import { EmissorDeToken, HashDeSenha } from '../usuarios/application/ports';
import { NovoUsuario, UsuarioRepository } from '../usuarios/domain/usuario.repository';
import { Usuario } from '../usuarios/domain/usuario';
import { EventPublisherFake } from './fakes-comum';

class UsuarioRepositoryFake extends UsuarioRepository {
  itens: Usuario[] = [];
  async criar(d: NovoUsuario) {
    const u = new Usuario(`id-${this.itens.length + 1}`, d.nome, d.email, d.tipo, d.consentimentoLgpdEm, d.senhaHash);
    this.itens.push(u);
    return u;
  }
  async existePorEmail(email: string) { return this.itens.some((u) => u.email === email); }
  async buscarPorEmailComSenha(email: string) { return this.itens.find((u) => u.email === email) ?? null; }
  async buscarPorId(id: string) { return this.itens.find((u) => u.id === id) ?? null; }
  async buscarPorIds(ids: string[]) { return this.itens.filter((u) => ids.includes(u.id)); }
  async excluir(id: string) { this.itens = this.itens.filter((u) => u.id !== id); }
}
class HashFake extends HashDeSenha {
  async gerar(senha: string) { return `hash(${senha})`; }
  async conferir(senha: string, hash: string) { return hash === `hash(${senha})`; }
}
class TokenFake extends EmissorDeToken {
  emitir(id: string, tipo: string) { return `token:${id}:${tipo}`; }
}

const dados = { nome: '  Maria  ', email: ' Maria@Teste.com ', senha: 'senha-forte-123', tipo: 'PESSOA' as const };

describe('Caso de uso: CadastrarUsuario', () => {
  const montar = () => {
    const repo = new UsuarioRepositoryFake();
    const eventos = new EventPublisherFake();
    return { repo, eventos, uc: new CadastrarUsuario(repo, new HashFake(), new TokenFake(), eventos) };
  };

  test('normaliza e-mail e nome, guarda só o hash da senha e devolve token', async () => {
    const { uc, repo } = montar();
    const r = await uc.executar(dados);
    assert.equal(r.usuario.email, 'maria@teste.com');
    assert.equal(r.usuario.nome, 'Maria');
    assert.equal(repo.itens[0].senhaHash, 'hash(senha-forte-123)');
    assert.notEqual(repo.itens[0].senhaHash, dados.senha);
    assert.equal(r.token, `token:${r.usuario.id}:PESSOA`);
  });
  test('publica UsuarioCadastrado', async () => {
    const { uc, eventos } = montar();
    await uc.executar(dados);
    assert.equal(eventos.publicados[0].nome, Eventos.UsuarioCadastrado);
    assert.equal(eventos.publicados[0].dados.email, 'maria@teste.com');
  });
  test('e-mail repetido (mesmo com outra caixa) → 409', async () => {
    const { uc } = montar();
    await uc.executar(dados);
    await assert.rejects(uc.executar({ ...dados, email: 'MARIA@teste.com' }), ConflitoError);
  });
});

describe('Caso de uso: LoginUsuario', () => {
  const montar = async () => {
    const repo = new UsuarioRepositoryFake();
    await new CadastrarUsuario(repo, new HashFake(), new TokenFake(), new EventPublisherFake()).executar(dados);
    return new LoginUsuario(repo, new HashFake(), new TokenFake());
  };

  test('credenciais corretas devolvem token', async () => {
    const r = await (await montar()).executar('MARIA@teste.com', 'senha-forte-123');
    assert.match(r.token, /^token:/);
  });
  test('senha errada e e-mail inexistente dão o mesmo erro (401)', async () => {
    const uc = await montar();
    await assert.rejects(uc.executar('maria@teste.com', 'errada'), NaoAutenticadoError);
    await assert.rejects(uc.executar('ninguem@teste.com', 'senha-forte-123'), NaoAutenticadoError);
  });
});
