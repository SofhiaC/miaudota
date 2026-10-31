import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, SectionList, Text, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';
import { CardAnimal, tentar, Vazio } from '../componentes';

export default function Animais() {
  const [sugestoes, setSugestoes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const r = await tentar(() => Promise.all([api.sugestoes(), api.animais()]));
    if (r) { setSugestoes(r[0]); setTodos(r[1]); }
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  async function curtir(id) {
    await tentar(() => api.curtir(id), 'Favoritado!');
    setSugestoes(await api.sugestoes().catch(() => sugestoes)); // curtir muda as sugestões
  }

  if (carregando) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const secoes = [];
  if (sugestoes.length) secoes.push({ titulo: '✨ Sugestões para você', data: sugestoes });
  secoes.push({ titulo: 'Todos os animais', data: todos });

  return (
    <SectionList
      sections={secoes}
      keyExtractor={(a, i) => a._id + '-' + i}
      renderSectionHeader={({ section }) => <Text style={s.secao}>{section.titulo}</Text>}
      ListEmptyComponent={<Vazio texto="Nenhum animal disponível" />}
      renderItem={({ item }) => (
        <CardAnimal animal={item}>
          <View style={s.linha}>
            <Button title="❤️ Curtir" onPress={() => curtir(item._id)} />
            <Button title="Solicitar adoção" onPress={() => tentar(() => api.solicitar(item._id), 'Solicitação enviada!')} />
          </View>
        </CardAnimal>
      )}
    />
  );
}
