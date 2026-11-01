import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, sombra } from '../tema';
import Icone from './Icone';

/** Barra inferior branca, de cantos arredondados; o ícone da aba atual fica preto e os outros cinza. */
export default function BarraDeAbas({ abas, atual, onSelecionar }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[e.barra, sombra, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {abas.map((a) => (
        <Pressable
          key={a.id}
          onPress={() => onSelecionar(a.id)}
          hitSlop={8}
          style={e.item}
          accessibilityRole="button"
          accessibilityLabel={a.rotulo}
          accessibilityState={{ selected: a.id === atual }}
        >
          <Icone nome={a.icone} tamanho={36} cor={a.id === atual ? cores.escuro : cores.cinzaIcone} />
        </Pressable>
      ))}
    </View>
  );
}

const e = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FCFCFC',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 14,
  },
  item: { padding: 4 },
});
