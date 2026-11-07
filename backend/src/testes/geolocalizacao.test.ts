import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { AcessoNegadoError, NaoEncontradoError, RegraDeNegocioError } from '../shared/errors';
import { Eventos } from '../shared/events/eventos';
import { Feira } from '../geolocalizacao/domain/feira';
import { caixaDelimitadora, distanciaKm } from '../geolocalizacao/domain/localizacao';
import { validarAnimaisDaOng } from '../geolocalizacao/application/validar-animais-da-ong';
import { MontarVisaoDasFeiras } from '../geolocalizacao/application/montar-visao-das-feiras';
import { CadastrarFeira } from '../geolocalizacao/casos-de-uso/cadastrar-feira/cadastrar-feira.use-case';
import { AtualizarFeira } from '../geolocalizacao/casos-de-uso/atualizar-feira/atualizar-feira.use-case';
import { ExcluirFeira } from '../geolocalizacao/casos-de-uso/excluir-feira/excluir-feira.use-case';
import { AnimaisGateway } from '../geolocalizacao/application/animais.gateway';
import { UsuarioGateway as UsuarioGatewayGeo } from '../geolocalizacao/application/usuario.gateway';
import { DONO, OUTRO, EventPublisherFake, FeiraRepositoryFake, emDias } from './fakes';

class AnimaisGatewayFake extends AnimaisGateway {
  constructor(private validos: number) { super(); }
  async contarDisponiveisDoDono() { return this.validos; }
}
class UsuarioGeoFake extends UsuarioGatewayGeo {
  async buscarResumos(ids: string[]) { return ids.map((id) => ({ id, nome: 'ONG Patinhas', email: 'ong@teste.com' })); }
}

const novaFeira = (parcial: Partial<Feira> = {}) =>
  Object.assign(new Feira('f1', 'Feira', undefined, 'Rua A', -25.4, -49.2, emDias(1), emDias(2), DONO, []), parcial);

describe('Domínio: Feira', () => {
  test('validarPeriodo aceita período futuro e coerente', () => {
    assert.doesNotThrow(() => Feira.validarPeriodo(emDias(1), emDias(2)));
  });
  test('fim antes do início → 422', () => {
    assert.throws(() => Feira.validarPeriodo(emDias(2), emDias(1)), RegraDeNegocioError);
  });
  test('feira que terminou no passado → 422', () => {
    assert.throws(() => Feira.validarPeriodo(emDias(-3), emDias(-2)), RegraDeNegocioError);
  });
  test('datas inválidas → 422', () => {
    assert.throws(() => Feira.validarPeriodo(new Date('x'), emDias(1)), RegraDeNegocioError);
  });
  test('acontecendoAgora considera o intervalo', () => {
    const f = novaFeira({ dataInicio: emDias(-1), dataFim: emDias(1) });
    assert.equal(f.acontecendoAgora(), true);
    assert.equal(novaFeira().acontecendoAgora(), false);
  });
  test('definirAnimais remove duplicados', () => {
    const f = novaFeira();
    f.definirAnimais(['a', 'b', 'a']);
    assert.deepEqual(f.animais, ['a', 'b']);
  });
  test('atualizar altera só o informado e revalida o período', () => {
    const f = novaFeira();
    f.atualizar({ nome: 'Nova' });
    assert.equal(f.nome, 'Nova');
    assert.equal(f.endereco, 'Rua A');
    assert.throws(() => f.atualizar({ dataFim: emDias(0.5) }), RegraDeNegocioError); // fim < início
  });
});

describe('Domínio: localização', () => {
  test('distância entre o mesmo ponto é zero', () => {
    assert.equal(distanciaKm(-25.4, -49.2, -25.4, -49.2), 0);
  });
  test('Curitiba → São Paulo ≈ 340 km', () => {
    const d = distanciaKm(-25.4284, -49.2733, -23.5505, -46.6333);
    assert.ok(d > 330 && d < 350, `distância ${d}`);
  });
  test('caixa delimitadora contém o ponto e cresce com o raio', () => {
    const c = caixaDelimitadora(-25.4, -49.2, 10);
    assert.ok(c.latMin < -25.4 && c.latMax > -25.4 && c.lngMin < -49.2 && c.lngMax > -49.2);
    const maior = caixaDelimitadora(-25.4, -49.2, 20);
    assert.ok(maior.latMax - maior.latMin > c.latMax - c.latMin);
  });
});

describe('validarAnimaisDaOng', () => {
  test('sem animais devolve lista vazia sem consultar', async () => {
    assert.deepEqual(await validarAnimaisDaOng(new AnimaisGatewayFake(0), DONO), []);
  });
  test('remove duplicados e aceita quando todos são válidos', async () => {
    assert.deepEqual(await validarAnimaisDaOng(new AnimaisGatewayFake(2), DONO, ['a', 'b', 'a']), ['a', 'b']);
  });
  test('animal que não é da ONG ou não está disponível → 422', async () => {
    await assert.rejects(validarAnimaisDaOng(new AnimaisGatewayFake(1), DONO, ['a', 'b']), RegraDeNegocioError);
  });
});

describe('Casos de uso de Feira (CRUD)', () => {
  const dados = () => ({
    idOng: DONO, nome: 'Feira', endereco: 'Rua A', latitude: -25.4, longitude: -49.2,
    dataInicio: emDias(1).toISOString(), dataFim: emDias(2).toISOString(),
  });
  const montar = (validos = 0) => {
    const feiras = new FeiraRepositoryFake();
    const eventos = new EventPublisherFake();
    const montarVisao = new MontarVisaoDasFeiras();
    return {
      feiras, eventos,
      cadastrar: new CadastrarFeira(feiras, new AnimaisGatewayFake(validos), montarVisao, eventos, new UsuarioGeoFake()),
      atualizar: new AtualizarFeira(feiras, montarVisao),
      excluir: new ExcluirFeira(feiras),
    };
  };

  test('cadastrar persiste a feira e publica FeiraCadastrada com o e-mail da ONG', async () => {
    const { cadastrar, feiras, eventos } = montar();
    const r = await cadastrar.executar(dados());
    assert.equal(feiras.itens.size, 1);
    assert.equal(r.feira.nome, 'Feira');
    assert.equal(eventos.publicados[0].nome, Eventos.FeiraCadastrada);
    assert.equal(eventos.publicados[0].dados.destinatarioEmail, 'ong@teste.com');
  });
  test('cadastrar com período inválido não persiste nada', async () => {
    const { cadastrar, feiras } = montar();
    await assert.rejects(cadastrar.executar({ ...dados(), dataFim: emDias(-5).toISOString() }), RegraDeNegocioError);
    assert.equal(feiras.itens.size, 0);
  });
  test('cadastrar com animal inválido → 422', async () => {
    const { cadastrar } = montar(0);
    await assert.rejects(cadastrar.executar({ ...dados(), animais: ['a1'] }), RegraDeNegocioError);
  });
  test('atualizar: ONG dona altera; outra ONG → 403; inexistente → 404', async () => {
    const { cadastrar, atualizar } = montar();
    const { feira } = await cadastrar.executar(dados());
    const r = await atualizar.executar(feira.id, DONO, { nome: 'Renomeada' });
    assert.equal(r.feira.nome, 'Renomeada');
    await assert.rejects(atualizar.executar(feira.id, OUTRO, { nome: 'X' }), AcessoNegadoError);
    await assert.rejects(atualizar.executar('nada', DONO, { nome: 'X' }), NaoEncontradoError);
  });
  test('excluir: ONG dona exclui; outra ONG → 403; inexistente → 404', async () => {
    const { cadastrar, excluir, feiras } = montar();
    const { feira } = await cadastrar.executar(dados());
    await assert.rejects(excluir.executar(feira.id, OUTRO), AcessoNegadoError);
    await excluir.executar(feira.id, DONO);
    assert.equal(feiras.itens.size, 0);
    await assert.rejects(excluir.executar(feira.id, DONO), NaoEncontradoError);
  });
  test('visão das feiras calcula a distância quando há origem', async () => {
    const [v] = await new MontarVisaoDasFeiras().executar([novaFeira()], { lat: -25.4, lng: -49.2 });
    assert.equal(v.distanciaKm, 0);
  });
});
