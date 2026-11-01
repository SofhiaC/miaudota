import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { cores } from '../tema';

export default function Carregando() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={cores.escuro} />
    </View>
  );
}
