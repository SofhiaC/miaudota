import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';

/** Lista os animais disponíveis do usuário e deixa marcar quais vão para a feira. */
export default function SeletorAnimais({ selecionados, onChange }) {
  const [lista, setLista] = useState(null);

  useEffect(() => {
    api.meusAnimais()
      .then((r) => setLista(r.filter((a) => a.disponivel)))
      .catch(() => setLista([]));
  }, []);

  if (!lista) return <ActivityIndicator />;
  if (!lista.length) return <Text style={s.rotulo}>Você não tem animais disponíveis para levar à feira.</Text>;

  const alternar = (id) =>
    onChange(selecionados.includes(id) ? selecionados.filter((x) => x !== id) : [...selecionados, id]);

  return (
    <View style={{ gap: 6 }}>
      <Text style={s.rotulo}>Animais que você levará:</Text>
      {lista.map((a) => (
        <TouchableOpacity key={a._id} onPress={() => alternar(a._id)}>
          <Text>{selecionados.includes(a._id) ? '☑' : '☐'} {a.nome} ({a.especie})</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
