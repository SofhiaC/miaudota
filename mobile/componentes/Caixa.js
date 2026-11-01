import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../tema';
import Icone from './Icone';

/** Caixa de marcação (ex.: consentimento da LGPD, escolha de animais da feira). */
export default function Caixa({ marcado, onAlternar, children }) {
  return (
    <Pressable onPress={onAlternar} style={e.linha} accessibilityRole="checkbox" accessibilityState={{ checked: marcado }}>
      <Icone nome={marcado ? 'marcado' : 'desmarcado'} tamanho={28} cor={marcado ? cores.escuro : cores.cinzaIcone} />
      <Text style={e.texto}>{children}</Text>
    </Pressable>
  );
}

const e = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  texto: { flex: 1, fontSize: 14, color: cores.escuro, fontWeight: '300' },
});
