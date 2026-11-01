import React from 'react';
import { Image, View } from 'react-native';

/**
 * Por enquanto todo animal usa a ilustração do filhote (o cadastro ainda não tem upload de foto).
 * A imagem é mostrada pelo topo, como no layout: cabeça e peito do bichinho.
 */
export default function FotoDoAnimal({ tamanho = 96, style }) {
  return (
    <View style={[{ width: tamanho, height: tamanho, overflow: 'hidden' }, style]}>
      <Image
        source={require('../assets/imagens/filhote.png')}
        style={{ width: tamanho, height: tamanho * (1200 / 675) }}
        accessibilityLabel="Ilustração do animal"
      />
    </View>
  );
}
