import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores, sombra, texto } from '../tema';
import FotoDoAnimal from './FotoDoAnimal';

/** Cartão branco das listas: foto à esquerda; título, duas linhas e rodapé à direita; `children` ocupa a largura toda embaixo. */
export default function CartaoLista({ titulo, linha2, linha3, rodape, children }) {
  return (
    <View style={[e.cartao, sombra]}>
      <View style={e.linha}>
        <FotoDoAnimal tamanho={96} />
        <View style={e.coluna}>
          <Text style={texto.titulo} numberOfLines={1}>{titulo}</Text>
          {!!linha2 && <Text style={texto.linha2} numberOfLines={1}>{linha2}</Text>}
          {!!linha3 && <Text style={texto.corpo} numberOfLines={3}>{linha3}</Text>}
          {rodape}
        </View>
      </View>
      {children}
    </View>
  );
}

const e = StyleSheet.create({
  cartao: { backgroundColor: cores.branco, borderRadius: 30, padding: 16, gap: 12 },
  linha: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  coluna: { flex: 1, gap: 2 },
});
