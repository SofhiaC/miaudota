import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { setToken, setAoExpirar } from './api';
import { s } from './estilos';
import Login from './screens/Login';
import Animais from './screens/Animais';
import Favoritos from './screens/Favoritos';
import MeusAnimais from './screens/MeusAnimais';
import Feiras from './screens/Feiras';
import Solicitacoes from './screens/Solicitacoes';
import Perfil from './screens/Perfil';

// PESSOA adota e publica animais. ONG publica animais e promove feiras, mas não adota.
const ABAS_PESSOA = [
  { id: 'animais', titulo: 'Animais' },
  { id: 'favoritos', titulo: 'Favoritos' },
  { id: 'meus', titulo: 'Meus animais' },
  { id: 'feiras', titulo: 'Feiras' },
  { id: 'solicitacoes', titulo: 'Pedidos' },
  { id: 'perfil', titulo: 'Perfil' },
];
const ABAS_ONG = [
  { id: 'meus', titulo: 'Meus animais' },
  { id: 'feiras', titulo: 'Feiras' },
  { id: 'solicitacoes', titulo: 'Pedidos' },
  { id: 'perfil', titulo: 'Perfil' },
];

function sessaoValida(r) {
  return !!(r && r.token && r.usuario && r.usuario.tipo);
}

export default function App() {
  const [sessao, setSessao] = useState(null); // { token, usuario }
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState(null);

  async function sair() {
    setToken(null);
    setSessao(null);
    setAba(null);
    await SecureStore.deleteItemAsync('sessao');
  }

  async function entrar(resposta) {
    if (!sessaoValida(resposta)) {
      throw new Error('Resposta inesperada do servidor: ' + JSON.stringify(resposta));
    }
    setToken(resposta.token);
    await SecureStore.setItemAsync('sessao', JSON.stringify(resposta));
    setAba(null);
    setSessao(resposta);
  }

  useEffect(() => {
    setAoExpirar(sair);
    SecureStore.getItemAsync('sessao')
      .then(async (raw) => {
        if (!raw) return;
        const r = JSON.parse(raw);
        if (sessaoValida(r)) {
          setToken(r.token);
          setSessao(r);
        } else {
          await SecureStore.deleteItemAsync('sessao'); // sessão antiga ou corrompida
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) return <SafeAreaView style={s.tela}><ActivityIndicator size="large" /></SafeAreaView>;
  if (!sessao) return <SafeAreaView style={s.tela}><Login onEntrar={entrar} /></SafeAreaView>;

  const { usuario } = sessao;
  const abas = usuario.tipo === 'ONG' ? ABAS_ONG : ABAS_PESSOA;
  const atual = aba ?? abas[0].id;

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.abas}>
        {abas.map((a) => (
          <TouchableOpacity key={a.id} style={[s.aba, atual === a.id && s.abaAtiva]} onPress={() => setAba(a.id)}>
            <Text style={s.abaTexto}>{a.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {atual === 'animais' && <Animais />}
        {atual === 'favoritos' && <Favoritos />}
        {atual === 'meus' && <MeusAnimais />}
        {atual === 'feiras' && <Feiras usuario={usuario} />}
        {atual === 'solicitacoes' && <Solicitacoes usuario={usuario} />}
        {atual === 'perfil' && <Perfil usuario={usuario} onSair={sair} />}
      </View>
    </SafeAreaView>
  );
}
