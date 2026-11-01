import { Platform, StyleSheet } from 'react-native';

/** Cores medidas no layout do Figma. */
export const cores = {
  fundo: '#FFE880', // amarelo de fundo
  cabecalho: '#4E4623', // barra do topo e botões "Solicitar Adoção"
  escuro: '#241A13', // botões principais e rótulos
  campo: '#F9F9F9', // campos de texto
  branco: '#FFFFFF',
  preto: '#000000',
  cinzaIcone: '#777777', // ícones inativos
  perigo: '#ED1F1F', // excluir conta, X
  remover: '#FF4141', // botão Remover
  curtir: '#EFA0DD', // coração
  painel: 'rgba(128,126,126,0.72)', // painel translúcido do cartão de animal
};

/** Madimi One: logo, títulos, rótulos e botões. Textos corridos usam a fonte do sistema, leve (como no layout). */
export const fonte = { titulo: 'MadimiOne_400Regular' };

export const texto = StyleSheet.create({
  logo: { fontFamily: fonte.titulo, fontSize: 54, color: cores.preto, textAlign: 'center' },
  titulo: { fontFamily: fonte.titulo, fontSize: 22, color: cores.preto },
  rotulo: { fontFamily: fonte.titulo, fontSize: 19, color: cores.escuro, marginLeft: 12, marginBottom: 4 },
  linha2: { fontSize: 17, color: cores.preto, fontWeight: '300' },
  corpo: { fontSize: 13, color: cores.preto, fontWeight: '300' },
  destaque: { fontFamily: fonte.titulo, fontSize: 15, color: cores.preto },
  dica: { fontFamily: fonte.titulo, fontSize: 18, color: cores.escuro, textAlign: 'center' },
});

export const sombra = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  android: { elevation: 4 },
});
