import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { cores } from '../tema';
import Cabecalho from './Cabecalho';

/** Tela cheia sobre o app para formulários (cadastrar animal, cadastrar feira). */
export default function Formulario({ visivel, titulo, onFechar, children }) {
  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onFechar}>
      <StatusBar barStyle="light-content" backgroundColor={cores.cabecalho} />
      <View style={e.tela}>
        <Cabecalho titulo={titulo} icone="fechar" onIcone={onFechar} />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 28, gap: 14, paddingBottom: 48 },
});
