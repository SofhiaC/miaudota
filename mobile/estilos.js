import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
  tela: { flex: 1, paddingTop: 40, backgroundColor: '#fff' },
  box: { padding: 20, gap: 10 },
  titulo: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 6 },
  linha: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 8 },
  abas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', paddingBottom: 8 },
  aba: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14 },
  abaAtiva: { backgroundColor: '#e0f2e0' },
  abaTexto: { fontSize: 15 },
  card: { borderWidth: 1, borderColor: '#ddd', margin: 8, padding: 12, borderRadius: 8, gap: 4 },
  nome: { fontWeight: 'bold', fontSize: 16 },
  vazio: { textAlign: 'center', marginTop: 40, color: '#888' },
  secao: { fontSize: 18, fontWeight: 'bold', padding: 10, backgroundColor: '#f4f4f4' },
  mapa: { height: 240 },
  verde: { color: 'green', fontWeight: 'bold' },
  rotulo: { color: '#555' },
});
