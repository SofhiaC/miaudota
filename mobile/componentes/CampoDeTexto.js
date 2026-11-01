import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores, sombra, texto } from '../tema';
import Icone from './Icone';

export default function CampoDeTexto({ rotulo, icone, multiline, style, ...props }) {
  return (
    <View style={style}>
      {!!rotulo && <Text style={texto.rotulo}>{rotulo}</Text>}
      <View style={[e.campo, multiline && e.campoMulti, sombra]}>
        {!!icone && <Icone nome={icone} tamanho={26} cor={cores.cinzaIcone} style={multiline ? e.iconeTopo : undefined} />}
        <TextInput
          style={[e.input, multiline && e.inputMulti]}
          placeholderTextColor="#A0A0A0"
          multiline={multiline}
          accessibilityLabel={rotulo}
          {...props}
        />
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.campo,
    borderRadius: 24,
    height: 50,
    paddingHorizontal: 16,
  },
  campoMulti: { height: 100, alignItems: 'flex-start', paddingTop: 12 },
  iconeTopo: { marginTop: 0 },
  input: { flex: 1, fontSize: 16, color: cores.preto, paddingVertical: 0 },
  inputMulti: { height: '100%', textAlignVertical: 'top' },
});
