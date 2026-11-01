import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '../tema';

// Nomes do app -> ícones vetoriais com o mesmo desenho do layout (contorno arredondado, nítidos em qualquer tela)
const NOMES = {
  favoritos: 'heart-outline',
  pedidos: 'clock-outline',
  descobrir: 'plus-circle-outline',
  feiras: 'map-marker-outline',
  meus: 'account-outline',
  perfil: 'account-outline',
  pessoa: 'account-outline',
  buscar: 'magnify',
  email: 'email-outline',
  senha: 'lock-outline',
  fechar: 'close',
  enviar: 'send-outline',
  curtir: 'heart-outline',
  marcado: 'checkbox-marked-outline',
  desmarcado: 'checkbox-blank-outline',
  nome: 'paw',
  especie: 'dog',
  idade: 'calendar-blank-outline',
  descricao: 'text-box-outline',
  endereco: 'map-marker-outline',
  data: 'calendar-clock-outline',
  coordenada: 'crosshairs-gps',
};

export default function Icone({ nome, tamanho = 28, cor = cores.cinzaIcone, style }) {
  return <MaterialCommunityIcons name={NOMES[nome] ?? nome} size={tamanho} color={cor} style={style} />;
}
