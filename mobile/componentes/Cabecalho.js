import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, fonte } from '../tema';
import Icone from './Icone';

/** Barra do topo: "miaudota" no centro e, à direita, o atalho para o perfil (ou o X nos formulários). */
export default function Cabecalho({ titulo = 'miaudota', icone = 'perfil', onIcone }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[e.barra, { paddingTop: insets.top }]}>
      <View style={e.conteudo}>
        <Text style={e.titulo}>{titulo}</Text>
        {!!onIcone && (
          <Pressable onPress={onIcone} hitSlop={12} style={e.icone} accessibilityRole="button" accessibilityLabel={icone === 'fechar' ? 'Fechar' : 'Perfil'}>
            <Icone nome={icone} tamanho={32} cor={cores.branco} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  barra: { backgroundColor: cores.cabecalho },
  conteudo: { height: 56, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fonte.titulo, fontSize: 26, color: cores.branco },
  icone: { position: 'absolute', right: 16 },
});
