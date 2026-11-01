import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CampoDeTexto from '../componentes/CampoDeTexto';
import Formulario from '../componentes/Formulario';
import { dataBrParaIso, tentar } from '../componentes/util';
import { texto } from '../tema';
import SeletorAnimais from './SeletorAnimais';

export default function CadastrarFeira({ visivel, onFechar, onCriada }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [animais, setAnimais] = useState([]);
  const [salvando, setSalvando] = useState(false);

  async function usarMinhaLocalizacao() {
    await tentar(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Permissão de localização negada');
      const { coords } = await Location.getCurrentPositionAsync({});
      setLat(String(coords.latitude));
      setLng(String(coords.longitude));
    });
  }

  async function buscarEndereco() {
    await tentar(async () => {
      const [r] = await Location.geocodeAsync(endereco);
      if (!r) throw new Error('Endereço não encontrado. Informe latitude e longitude.');
      setLat(String(r.latitude));
      setLng(String(r.longitude));
    });
  }

  async function salvar() {
    const dataInicio = dataBrParaIso(inicio);
    const dataFim = dataBrParaIso(fim);
    if (!dataInicio || !dataFim) {
      return tentar(async () => { throw new Error('Informe as datas no formato 12/03/2026 12:00'); });
    }
    setSalvando(true);
    const dados = {
      nome, endereco,
      ...(descricao ? { descricao } : {}),
      latitude: Number(lat), longitude: Number(lng),
      dataInicio, dataFim, animais,
    };
    const r = await tentar(() => api.criarFeira(dados), 'Feira cadastrada!');
    setSalvando(false);
    if (r) {
      setNome(''); setDescricao(''); setEndereco(''); setLat(''); setLng(''); setInicio(''); setFim(''); setAnimais([]);
      onCriada();
    }
  }

  return (
    <Formulario visivel={visivel} titulo="Cadastrar feira" onFechar={onFechar}>
      <CampoDeTexto rotulo="Nome da feira" icone="nome" value={nome} onChangeText={setNome} autoCapitalize="words" />
      <CampoDeTexto rotulo="Descrição" icone="descricao" value={descricao} onChangeText={setDescricao} multiline />
      <CampoDeTexto rotulo="Endereço" icone="endereco" value={endereco} onChangeText={setEndereco} />
      <View style={e.linha}>
        <Botao titulo="Buscar pelo endereço" variante="oliva" tamanho="pequeno" onPress={buscarEndereco} />
        <Botao titulo="Usar minha posição" variante="oliva" tamanho="pequeno" onPress={usarMinhaLocalizacao} />
      </View>
      <View style={e.linha}>
        <CampoDeTexto rotulo="Latitude" icone="coordenada" value={lat} onChangeText={setLat} keyboardType="numbers-and-punctuation" style={e.metade} />
        <CampoDeTexto rotulo="Longitude" icone="coordenada" value={lng} onChangeText={setLng} keyboardType="numbers-and-punctuation" style={e.metade} />
      </View>
      <CampoDeTexto rotulo="Início" icone="data" value={inicio} onChangeText={setInicio} placeholder="12/03/2026 12:00" />
      <CampoDeTexto rotulo="Fim" icone="data" value={fim} onChangeText={setFim} placeholder="12/03/2026 18:00" />
      <Text style={[texto.corpo, { marginLeft: 12 }]}>Datas no formato dia/mês/ano hora:minuto.</Text>
      <SeletorAnimais selecionados={animais} onChange={setAnimais} />
      <Botao titulo="Salvar" variante="escuroAmarelo" onPress={salvar} carregando={salvando} style={{ marginTop: 10 }} />
    </Formulario>
  );
}

const e = StyleSheet.create({
  linha: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metade: { flex: 1 },
});
