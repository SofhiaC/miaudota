import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, fonte, sombra } from '../tema';

/** Faixa branca com duas opções (ex.: "Enviados por Mim" / "Recebidos"). */
export default function SubAbas({ opcoes, atual, onSelecionar }) {
  return (
    <View style={[e.faixa, sombra]}>
      {opcoes.map((o) => (
        <Pressable key={o.id} style={e.opcao} onPress={() => onSelecionar(o.id)} accessibilityRole="tab" accessibilityState={{ selected: o.id === atual }}>
          <Text style={[e.texto, { color: o.id === atual ? cores.preto : cores.cinzaIcone }]}>{o.rotulo}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const e = StyleSheet.create({
  faixa: { flexDirection: 'row', backgroundColor: cores.branco, height: 52 },
  opcao: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  texto: { fontFamily: fonte.titulo, fontSize: 20 },
});
