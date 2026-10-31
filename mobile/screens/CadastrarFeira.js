import React, { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { api } from '../api';
import { s } from '../estilos';
import { tentar } from '../componentes';
import SeletorAnimais from './SeletorAnimais';

// "2026-11-15 09:00" (horário local) -> ISO
function paraIso(texto) {
  const d = new Date(texto.trim().replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function CadastrarFeira({ onCriada }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [animais, setAnimais] = useState([]);

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
      if (!r) throw new Error('Endereço não encontrado. Informe latitude/longitude manualmente.');
      setLat(String(r.latitude));
      setLng(String(r.longitude));
    });
  }

  async function salvar() {
    const dataInicio = paraIso(inicio);
    const dataFim = paraIso(fim);
    if (!dataInicio || !dataFim) return tentar(async () => { throw new Error('Datas devem estar no formato AAAA-MM-DD HH:MM'); });

    const dados = {
      nome, endereco,
      ...(descricao ? { descricao } : {}),
      latitude: Number(lat), longitude: Number(lng),
      dataInicio, dataFim, animais,
    };
    const r = await tentar(() => api.criarFeira(dados), 'Feira cadastrada!');
    if (r) onCriada();
  }

  return (
    <View style={s.box}>
      <TextInput style={s.input} placeholder="Nome da feira" value={nome} onChangeText={setNome} />
      <TextInput style={s.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
      <TextInput style={s.input} placeholder="Endereço" value={endereco} onChangeText={setEndereco} />
      <View style={s.linha}>
        <Button title="Buscar pelo endereço" onPress={buscarEndereco} />
        <Button title="Usar minha posição" onPress={usarMinhaLocalizacao} />
      </View>
      <TextInput style={s.input} placeholder="Latitude" keyboardType="numbers-and-punctuation" value={lat} onChangeText={setLat} />
      <TextInput style={s.input} placeholder="Longitude" keyboardType="numbers-and-punctuation" value={lng} onChangeText={setLng} />
      <Text style={s.rotulo}>Datas no formato AAAA-MM-DD HH:MM</Text>
      <TextInput style={s.input} placeholder="Início (2026-11-15 09:00)" value={inicio} onChangeText={setInicio} />
      <TextInput style={s.input} placeholder="Fim (2026-11-15 17:00)" value={fim} onChangeText={setFim} />
      <SeletorAnimais selecionados={animais} onChange={setAnimais} />
      <Button title="Salvar feira" onPress={salvar} />
    </View>
  );
}
