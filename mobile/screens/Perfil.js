import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import Botao from '../componentes/Botao';
import { cores, fonte } from '../tema';

export default function Perfil({ usuario, onSair }) {
  const ong = usuario.tipo === 'ONG';

  function excluir() {
    Alert.alert(
      'Excluir conta',
      'Seus dados serão apagados permanentemente, incluindo seus animais, favoritos e solicitações' + (ong ? ' e suas feiras.' : '.'),
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try { await api.excluirConta(); await onSair(); }
            catch (erro) { Alert.alert('Erro', erro.message); }
          },
        },
      ],
    );
  }

  return (
    <View style={e.tela}>
      <View style={e.dados}>
        <Text style={e.nome}>{usuario.nome}</Text>
        <Text style={e.email}>{usuario.email}</Text>
        <Text style={e.tipo}>{ong ? 'ONG' : 'Pessoa'}</Text>
      </View>
      <View style={e.botoes}>
        <Botao titulo="Sair" onPress={onSair} />
        <Botao titulo="Excluir Minha Conta" variante="perigo" onPress={excluir} />
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1 },
  dados: { padding: 28, gap: 2 },
  nome: { fontFamily: fonte.titulo, fontSize: 30, color: cores.preto },
  email: { fontSize: 18, color: cores.preto, fontWeight: '300' },
  tipo: { fontSize: 14, color: cores.preto, fontWeight: '300' },
  botoes: { alignSelf: 'center', width: '75%', maxWidth: 380, gap: 18, marginTop: 28 },
});
