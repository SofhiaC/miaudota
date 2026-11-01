import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { texto } from '../tema';

export default function Vazio({ texto: mensagem }) {
  return <Text style={[texto.dica, e.vazio]}>{mensagem}</Text>;
}

const e = StyleSheet.create({ vazio: { marginTop: 60, paddingHorizontal: 32 } });
