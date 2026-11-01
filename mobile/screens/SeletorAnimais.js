import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import Caixa from '../componentes/Caixa';
import { cores, texto } from '../tema';
import { capitalizar } from '../componentes/util';

/** Lista os animais disponíveis da ONG e deixa marcar quais vão para a feira. */
export default function SeletorAnimais({ selecionados, onChange }) {
  const [lista, setLista] = useState(null);

  useEffect(() => {
    api.meusAnimais()
      .then((r) => setLista(r.filter((a) => a.disponivel)))
      .catch(() => setLista([]));
  }, []);

  if (!lista) return <ActivityIndicator color={cores.escuro} />;
  if (!lista.length) return <Text style={texto.corpo}>Você não tem animais disponíveis para levar à feira.</Text>;

  const alternar = (id) => onChange(selecionados.includes(id) ? selecionados.filter((x) => x !== id) : [...selecionados, id]);

  return (
    <View style={e.lista}>
      <Text style={texto.rotulo}>Animais que você levará</Text>
      {lista.map((a) => (
        <Caixa key={a._id} marcado={selecionados.includes(a._id)} onAlternar={() => alternar(a._id)}>
          {a.nome} ({capitalizar(a.especie)})
        </Caixa>
      ))}
    </View>
  );
}

const e = StyleSheet.create({ lista: { gap: 8 } });
