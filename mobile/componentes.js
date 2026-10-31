import React from 'react';
import { Alert, Text, View } from 'react-native';
import { s } from './estilos';

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

export function CardAnimal({ animal, children }) {
  return (
    <View style={s.card}>
      <Text style={s.nome}>
        {animal.nome} — {animal.especie}, {animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}
      </Text>
      {!!animal.descricao && <Text>{animal.descricao}</Text>}
      {children}
    </View>
  );
}

export const Vazio = ({ texto }) => <Text style={s.vazio}>{texto}</Text>;
