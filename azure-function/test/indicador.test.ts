import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularIndicador } from '../src/dominio/indicador';

const AGORA = new Date('2026-11-07T12:00:00.000Z');

test('sem animais e sem feiras: nível BAIXA e animaisPorFeira nulo', () => {
  const r = calcularIndicador(0, 0, AGORA);
  assert.equal(r.nivel, 'BAIXA');
  assert.equal(r.pontuacao, 0);
  assert.equal(r.animaisPorFeira, null);
  assert.equal(r.geradoEm, '2026-11-07T12:00:00.000Z');
});

test('animais e feiras em quantidade média: nível MEDIA', () => {
  const r = calcularIndicador(20, 2, AGORA); // 2*12 + 20 = 44
  assert.equal(r.pontuacao, 44);
  assert.equal(r.nivel, 'MEDIA');
  assert.equal(r.animaisPorFeira, 10);
});

test('muitos animais e feiras: nível ALTA e pontuação limitada a 100', () => {
  const r = calcularIndicador(500, 50, AGORA);
  assert.equal(r.pontuacao, 100);
  assert.equal(r.nivel, 'ALTA');
});

test('fronteiras dos níveis', () => {
  assert.equal(calcularIndicador(34, 0, AGORA).nivel, 'BAIXA');
  assert.equal(calcularIndicador(35, 0, AGORA).nivel, 'MEDIA');
  assert.equal(calcularIndicador(10, 5, AGORA).nivel, 'ALTA'); // 60 + 10 = 70
});
