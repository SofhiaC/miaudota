import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { MadimiOne_400Regular, useFonts } from '@expo-google-fonts/madimi-one';
import { setAoExpirar, setToken } from './api';
import BarraDeAbas from './componentes/BarraDeAbas';
import Cabecalho from './componentes/Cabecalho';
import Carregando from './componentes/Carregando';
import { cores } from './tema';
import Descobrir from './screens/Descobrir';
import Favoritos from './screens/Favoritos';
import Feiras from './screens/Feiras';
import Login from './screens/Login';
import MeusAnimais from './screens/MeusAnimais';
import Pedidos from './screens/Pedidos';
import Perfil from './screens/Perfil';

// Ordem e ícones da barra inferior, como no layout. O ícone de perfil fica no topo.
const ABAS_PESSOA = [
  { id: 'favoritos', icone: 'favoritos', rotulo: 'Favoritos' },
  { id: 'pedidos', icone: 'pedidos', rotulo: 'Pedidos' },
  { id: 'descobrir', icone: 'descobrir', rotulo: 'Descobrir animais' },
  { id: 'feiras', icone: 'feiras', rotulo: 'Feiras' },
  { id: 'meus', icone: 'meus', rotulo: 'Meus animais' },
];
// ONG não adota: sem Descobrir nem Favoritos.
const ABAS_ONG = [
  { id: 'pedidos', icone: 'pedidos', rotulo: 'Pedidos' },
  { id: 'feiras', icone: 'feiras', rotulo: 'Feiras' },
  { id: 'meus', icone: 'meus', rotulo: 'Meus animais' },
];

function sessaoValida(r) {
  return !!(r && r.token && r.usuario && r.usuario.tipo);
}

function Aplicativo() {
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

  if (carregando) return <View style={e.tela}><Carregando /></View>;

  if (!sessao) {
    return (
      <View style={e.tela}>
        <StatusBar barStyle="dark-content" backgroundColor={cores.fundo} />
        <Login onEntrar={entrar} />
      </View>
    );
  }

  const { usuario } = sessao;
  const abas = usuario.tipo === 'ONG' ? ABAS_ONG : ABAS_PESSOA;
  const inicial = usuario.tipo === 'ONG' ? 'meus' : 'descobrir';
  const atual = aba ?? inicial;

  return (
    <View style={e.tela}>
      <StatusBar barStyle="light-content" backgroundColor={cores.cabecalho} />
      <Cabecalho onIcone={() => setAba('perfil')} />
      <View style={{ flex: 1 }}>
        {atual === 'descobrir' && <Descobrir />}
        {atual === 'favoritos' && <Favoritos />}
        {atual === 'pedidos' && <Pedidos usuario={usuario} />}
        {atual === 'feiras' && <Feiras usuario={usuario} />}
        {atual === 'meus' && <MeusAnimais />}
        {atual === 'perfil' && <Perfil usuario={usuario} onSair={sair} />}
      </View>
      <BarraDeAbas abas={abas} atual={atual} onSelecionar={setAba} />
    </View>
  );
}

export default function App() {
  const [fontesProntas, erroNaFonte] = useFonts({ MadimiOne_400Regular });
  return (
    <SafeAreaProvider>
      {fontesProntas || erroNaFonte ? <Aplicativo /> : <View style={e.tela}><Carregando /></View>}
    </SafeAreaProvider>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
});
