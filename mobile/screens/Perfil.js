import React from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';

export default function Perfil({ usuario, onSair }) {
  const ong = usuario.tipo === 'ONG';

  function excluir() {
    Alert.alert(
      'Excluir conta',
      'Seus dados serão apagados permanentemente, incluindo seus animais, favoritos e solicitações' + (ong ? ' e suas feiras.' : '.'),
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir', style: 'destructive',
          onPress: async () => {
            try { await api.excluirConta(); await onSair(); }
            catch (e) { Alert.alert('Erro', e.message); }
          },
        },
      ],
    );
  }

  return (
    <View style={s.box}>
      <Text style={s.nome}>{usuario.nome}</Text>
      <Text>{usuario.email}</Text>
      <Text style={s.rotulo}>{ong ? 'ONG' : 'Pessoa'}</Text>
      <Button title="Sair" onPress={onSair} />
      <Button title="Excluir minha conta" color="red" onPress={excluir} />
    </View>
  );
}
