import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { AcessoNegadoError, ConflitoError, NaoEncontradoError, RegraDeNegocioError } from '../shared/errors';
import { Eventos } from '../shared/events/eventos';
import { SolicitarAdocao } from '../adocao/casos-de-uso/solicitar-adocao/solicitar-adocao.use-case';
import { ResponderSolicitacao } from '../adocao/casos-de-uso/responder-solicitacao/responder-solicitacao.use-case';
import { AtualizarAnimal } from '../adocao/casos-de-uso/atualizar-animal/atualizar-animal.use-case';
import { ExcluirAnimal } from '../adocao/casos-de-uso/excluir-animal/excluir-animal.use-case';
import { FavoritarAnimal } from '../adocao/casos-de-uso/favoritar-animal/favoritar-animal.use-case';
import { ADOTANTE, DONO, OUTRO, EventPublisherFake } from './fakes-comum';
import {
  AnimalRepositoryFake, FavoritoRepositoryFake, SolicitacaoRepositoryFake, UsuarioGatewayFake, novoAnimal,
} from './fakes-adocao';

describe('Domínio: Animal', () => {
  test('atualizar normaliza os campos (trim e espécie em minúsculas)', () => {
    const a = novoAnimal();
    a.atualizar({ nome: '  Thor ', especie: ' GATO ', idade: 5 });
    assert.equal(a.nome, 'Thor');
    assert.equal(a.especie, 'gato');
    assert.equal(a.idade, 5);
  });
  test('campos não informados permanecem como estavam', () => {
    const a = novoAnimal();
    a.atualizar({ idade: 4 });
    assert.equal(a.nome, 'Rex');
    assert.equal(a.descricao, 'dócil');
  });
  test('animal adotado não pode ser alterado (422)', () => {
    const a = novoAnimal();
    a.marcarComoAdotado();
    assert.equal(a.adotado, true);
    assert.throws(() => a.atualizar({ nome: 'X' }), RegraDeNegocioError);
  });
  test('ehDe identifica o dono', () => {
    const a = novoAnimal();
    assert.equal(a.ehDe(DONO), true);
    assert.equal(a.ehDe(OUTRO), false);
  });
});

describe('Domínio: Solicitação', () => {
  test('só pode ser respondida uma vez (409)', async () => {
    const repo = new SolicitacaoRepositoryFake();
    const s = await repo.criar(ADOTANTE, 'animal-1');
    s.responder('RECUSADA');
    assert.equal(s.status, 'RECUSADA');
    assert.throws(() => s.responder('APROVADA'), ConflitoError);
  });
});

describe('Caso de uso: SolicitarAdocao', () => {
  const montar = (opts: { falhaUsuarios?: boolean } = {}) => {
    const animais = new AnimalRepositoryFake(novoAnimal());
    const solicitacoes = new SolicitacaoRepositoryFake();
    const eventos = new EventPublisherFake();
    const uc = new SolicitarAdocao(animais, solicitacoes, new UsuarioGatewayFake(opts.falhaUsuarios), eventos);
    return { animais, solicitacoes, eventos, uc };
  };

  test('cria a solicitação pendente e publica SolicitacaoAdocaoCriada com o e-mail do dono', async () => {
    const { uc, eventos } = montar();
    const s = await uc.executar(ADOTANTE, 'animal-1');
    assert.equal(s.status, 'PENDENTE');
    assert.equal(eventos.publicados.length, 1);
    assert.equal(eventos.publicados[0].nome, Eventos.SolicitacaoAdocaoCriada);
    assert.equal(eventos.publicados[0].dados.destinatarioEmail, 'aa@teste.com');
    assert.equal(eventos.publicados[0].dados.animalNome, 'Rex');
  });
  test('animal inexistente → 404', async () => {
    await assert.rejects(montar().uc.executar(ADOTANTE, 'nao-existe'), NaoEncontradoError);
  });
  test('dono não pode adotar o próprio animal → 403', async () => {
    await assert.rejects(montar().uc.executar(DONO, 'animal-1'), AcessoNegadoError);
  });
  test('animal indisponível → 409', async () => {
    const { uc, animais } = montar();
    animais.itens.get('animal-1')!.marcarComoAdotado();
    await assert.rejects(uc.executar(ADOTANTE, 'animal-1'), ConflitoError);
  });
  test('solicitação pendente duplicada → 409', async () => {
    const { uc } = montar();
    await uc.executar(ADOTANTE, 'animal-1');
    await assert.rejects(uc.executar(ADOTANTE, 'animal-1'), ConflitoError);
  });
  test('se o serviço de usuários cair, a solicitação continua valendo (evento sem e-mail)', async () => {
    const { uc, eventos } = montar({ falhaUsuarios: true });
    const s = await uc.executar(ADOTANTE, 'animal-1');
    assert.equal(s.status, 'PENDENTE');
    assert.equal(eventos.publicados[0].dados.destinatarioEmail, undefined);
  });
});

describe('Caso de uso: ResponderSolicitacao', () => {
  const montar = async () => {
    const animais = new AnimalRepositoryFake(novoAnimal());
    const solicitacoes = new SolicitacaoRepositoryFake();
    const s1 = await solicitacoes.criar(ADOTANTE, 'animal-1');
    const s2 = await solicitacoes.criar(OUTRO, 'animal-1');
    return { animais, solicitacoes, s1, s2, uc: new ResponderSolicitacao(animais, solicitacoes) };
  };

  test('aprovar marca o animal como adotado e recusa as demais pendentes', async () => {
    const { uc, animais, solicitacoes, s1, s2 } = await montar();
    await uc.executar(s1.id, DONO, 'APROVADA');
    assert.equal(animais.itens.get('animal-1')!.adotado, true);
    assert.equal(solicitacoes.itens.get(s1.id)!.status, 'APROVADA');
    assert.equal(solicitacoes.itens.get(s2.id)!.status, 'RECUSADA');
  });
  test('recusar não altera a disponibilidade do animal', async () => {
    const { uc, animais, s1 } = await montar();
    await uc.executar(s1.id, DONO, 'RECUSADA');
    assert.equal(animais.itens.get('animal-1')!.disponivel, true);
  });
  test('só o dono do animal responde → 403', async () => {
    const { uc, s1 } = await montar();
    await assert.rejects(uc.executar(s1.id, ADOTANTE, 'APROVADA'), AcessoNegadoError);
  });
  test('solicitação inexistente → 404', async () => {
    const { uc } = await montar();
    await assert.rejects(uc.executar('x', DONO, 'APROVADA'), NaoEncontradoError);
  });
  test('responder duas vezes → 409', async () => {
    const { uc, s1 } = await montar();
    await uc.executar(s1.id, DONO, 'RECUSADA');
    await assert.rejects(uc.executar(s1.id, DONO, 'APROVADA'), ConflitoError);
  });
});

describe('Casos de uso: AtualizarAnimal / ExcluirAnimal (CRUD)', () => {
  test('dono atualiza o animal e a alteração é persistida', async () => {
    const animais = new AnimalRepositoryFake(novoAnimal());
    const a = await new AtualizarAnimal(animais).executar('animal-1', DONO, { nome: 'Thor' });
    assert.equal(a.nome, 'Thor');
    assert.equal(animais.itens.get('animal-1')!.nome, 'Thor');
  });
  test('quem não é dono não atualiza → 403; inexistente → 404', async () => {
    const uc = new AtualizarAnimal(new AnimalRepositoryFake(novoAnimal()));
    await assert.rejects(uc.executar('animal-1', OUTRO, { nome: 'X' }), AcessoNegadoError);
    await assert.rejects(uc.executar('nada', DONO, { nome: 'X' }), NaoEncontradoError);
  });
  test('excluir remove o animal, os favoritos e as solicitações dele', async () => {
    const animais = new AnimalRepositoryFake(novoAnimal());
    const favoritos = new FavoritoRepositoryFake();
    const solicitacoes = new SolicitacaoRepositoryFake();
    await favoritos.salvar(ADOTANTE, 'animal-1');
    await solicitacoes.criar(ADOTANTE, 'animal-1');
    await new ExcluirAnimal(animais, favoritos, solicitacoes).executar('animal-1', DONO);
    assert.equal(animais.itens.size, 0);
    assert.equal(favoritos.pares.length, 0);
    assert.equal(solicitacoes.itens.size, 0);
  });
  test('animal adotado não pode ser excluído → 422', async () => {
    const animais = new AnimalRepositoryFake(novoAnimal({ disponivel: false }));
    const uc = new ExcluirAnimal(animais, new FavoritoRepositoryFake(), new SolicitacaoRepositoryFake());
    await assert.rejects(uc.executar('animal-1', DONO), RegraDeNegocioError);
  });
  test('só o dono exclui → 403', async () => {
    const uc = new ExcluirAnimal(new AnimalRepositoryFake(novoAnimal()), new FavoritoRepositoryFake(), new SolicitacaoRepositoryFake());
    await assert.rejects(uc.executar('animal-1', OUTRO), AcessoNegadoError);
  });
});

describe('Caso de uso: FavoritarAnimal', () => {
  test('favorita animal existente e rejeita inexistente', async () => {
    const favoritos = new FavoritoRepositoryFake();
    const uc = new FavoritarAnimal(new AnimalRepositoryFake(novoAnimal()), favoritos);
    await uc.executar(ADOTANTE, 'animal-1');
    assert.deepEqual(favoritos.pares, [`${ADOTANTE}|animal-1`]);
    await assert.rejects(uc.executar(ADOTANTE, 'nada'), NaoEncontradoError);
  });
});
