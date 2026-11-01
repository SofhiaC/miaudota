import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores, fonte, sombra } from '../tema';

const VARIANTES = {
  escuro: { fundo: cores.escuro, texto: cores.branco },
  escuroAmarelo: { fundo: cores.escuro, texto: cores.fundo }, // "Entrar" e "Cadastrar"
  oliva: { fundo: cores.cabecalho, texto: cores.branco }, // "Solicitar Adoção"
  remover: { fundo: cores.remover, texto: cores.branco },
  perigo: { fundo: cores.perigo, texto: cores.branco }, // "Excluir Minha Conta"
  claro: { fundo: cores.branco, texto: cores.escuro },
};

export default function Botao({ titulo, onPress, variante = 'escuro', tamanho = 'grande', desabilitado, carregando, style }) {
  const v = VARIANTES[variante];
  const grande = tamanho === 'grande';
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado || carregando}
      accessibilityRole="button"
      style={({ pressed }) => [
        e.base,
        grande ? e.grande : e.pequeno,
        sombra,
        { backgroundColor: v.fundo, opacity: desabilitado ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <Text style={[e.texto, grande ? e.textoGrande : e.textoPequeno, { color: v.texto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const e = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  grande: { height: 52, borderRadius: 26, paddingHorizontal: 24 },
  pequeno: { height: 36, borderRadius: 18, paddingHorizontal: 18 },
  texto: { fontFamily: fonte.titulo },
  textoGrande: { fontSize: 21 },
  textoPequeno: { fontSize: 15 },
});
