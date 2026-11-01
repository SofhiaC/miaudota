import { Alert } from 'react-native';
import { api } from '../api';

/** Executa a ação; se falhar mostra o erro, se der certo mostra `ok` (opcional). */
export async function tentar(fn, ok) {
  try {
    const r = await fn();
    if (ok) Alert.alert(ok);
    return r;
  } catch (e) {
    Alert.alert('Erro', e.message);
  }
}

export const capitalizar = (t = '') => t.charAt(0).toUpperCase() + t.slice(1);

export function rotuloIdade(idade) {
  if (idade === 0) return 'menos de 1 ano';
  return idade === 1 ? '1 ano' : `${idade} anos`;
}

const dois = (n) => String(n).padStart(2, '0');

/** 12/03/2026 12:00 */
export function fmtData(d) {
  const x = new Date(d);
  return `${dois(x.getDate())}/${dois(x.getMonth() + 1)}/${x.getFullYear()} ${dois(x.getHours())}:${dois(x.getMinutes())}`;
}

/** "12/03/2026 12:00" (horário local) -> ISO, ou null se estiver fora do formato. */
export function dataBrParaIso(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/.exec(texto.trim());
  if (!m) return null;
  const [dia, mes, ano, hora, min] = m.slice(1).map(Number);
  const data = new Date(ano, mes - 1, dia, hora, min);
  return isNaN(data.getTime()) ? null : data.toISOString();
}

/** Pede confirmação e abre a solicitação de adoção. `aoConcluir` roda só se der certo. */
export function solicitarAdocao(animal, aoConcluir) {
  Alert.alert(
    `Solicitar a adoção de ${animal.nome}?`,
    'Quem cuida dele será avisado e poderá aprovar ou recusar o pedido.',
    [
      { text: 'Agora não', style: 'cancel' },
      {
        text: 'Solicitar',
        onPress: async () => {
          const r = await tentar(() => api.solicitar(animal._id));
          if (r) {
            Alert.alert('Pedido enviado!', 'Acompanhe a resposta na aba Pedidos.');
            aoConcluir?.();
          }
        },
      },
    ],
  );
}
