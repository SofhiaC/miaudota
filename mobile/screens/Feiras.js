import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CartaoLista from '../componentes/CartaoLista';
import Carregando from '../componentes/Carregando';
import SubAbas from '../componentes/SubAbas';
import Vazio from '../componentes/Vazio';
import { fmtData, tentar } from '../componentes/util';
import { cores, fonte, texto } from '../tema';
import CadastrarFeira from './CadastrarFeira';
import SeletorAnimais from './SeletorAnimais';

const BRASIL = { latitude: -14.2, longitude: -51.9, latitudeDelta: 40, longitudeDelta: 40 };

// No emulador sem localização definida a posição nunca chega; sem isso o carregamento ficava eterno.
const comTimeout = (promessa, ms) =>
  Promise.race([promessa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

function EditarAnimais({ feira, onSalvo }) {
  const [ids, setIds] = useState(feira.animais.map((a) => a._id));

  async function salvar() {
    const r = await tentar(() => api.definirAnimaisFeira(feira._id, ids), 'Animais da feira atualizados!');
    if (r) onSalvo();
  }

  return (
    <View style={{ gap: 10 }}>
      <SeletorAnimais selecionados={ids} onChange={setIds} />
      <Botao titulo="Salvar animais" variante="oliva" tamanho="pequeno" onPress={salvar} style={{ alignSelf: 'flex-start' }} />
    </View>
  );
}

export default function Feiras({ usuario }) {
  const [modo, setModo] = useState('lista'); // 'lista' | 'mapa'
  const [feiras, setFeiras] = useState([]);
  const [posicao, setPosicao] = useState(null);
  const [carregado, setCarregado] = useState(false);
  const [cadastrando, setCadastrando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const carregar = useCallback(async () => {
    // 1) tenta pegar a posição; sem ela, mostra todas as feiras
    let pos = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let coords = (await Location.getLastKnownPositionAsync())?.coords;
        if (!coords) {
          const atual = await comTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 8000);
          coords = atual.coords;
        }
        pos = { lat: coords.latitude, lng: coords.longitude };
      }
    } catch {}
    setPosicao(pos);

    // 2) a lista sempre aparece, mesmo que o mapa falhe
    const r = await tentar(() => (pos ? api.feirasProximas(pos.lat, pos.lng) : api.feiras()));
    if (r) setFeiras(r);
    setCarregado(true);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  if (!carregado) return <Carregando />;

  const ehOng = usuario.tipo === 'ONG';
  const regiao = posicao
    ? { latitude: posicao.lat, longitude: posicao.lng, latitudeDelta: 0.3, longitudeDelta: 0.3 }
    : feiras[0]
      ? { latitude: feiras[0].latitude, longitude: feiras[0].longitude, latitudeDelta: 0.3, longitudeDelta: 0.3 }
      : BRASIL;

  return (
    <View style={{ flex: 1 }}>
      <SubAbas opcoes={[{ id: 'lista', rotulo: 'Lista' }, { id: 'mapa', rotulo: 'Mapa' }]} atual={modo} onSelecionar={setModo} />

      {modo === 'mapa' ? (
        <MapView style={{ flex: 1 }} initialRegion={regiao} showsUserLocation={!!posicao}>
          {feiras.map((f) => (
            <Marker
              key={f._id}
              coordinate={{ latitude: f.latitude, longitude: f.longitude }}
              title={f.nome}
              description={f.endereco}
              pinColor={f.acontecendoAgora ? 'green' : 'orange'}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          data={feiras}
          extraData={editandoId}
          keyExtractor={(f) => f._id}
          contentContainerStyle={e.lista}
          ListHeaderComponent={
            ehOng ? <Botao titulo="Cadastrar Feira" onPress={() => setCadastrando(true)} style={e.cadastrar} /> : null
          }
          ListEmptyComponent={<Vazio texto="Nenhuma feira por perto." />}
          renderItem={({ item }) => {
            const minha = ehOng && item.id_ong === usuario._id;
            const editando = editandoId === item._id;
            const n = item.animais.length;
            return (
              <CartaoLista
                titulo={item.nome}
                linha2={item.endereco}
                linha3={item.descricao}
                rodape={
                  <>
                    {item.acontecendoAgora && <Text style={e.agora}>Acontecendo agora</Text>}
                    <Text style={[texto.linha2, e.periodo]}>{fmtData(item.dataInicio)} - {fmtData(item.dataFim)}</Text>
                    {item.distanciaKm != null && <Text style={texto.corpo}>{item.distanciaKm} km de você</Text>}
                    <Text style={e.animais}>{n} {n === 1 ? 'Animal Disponível' : 'Animais Disponíveis'}</Text>
                  </>
                }
              >
                {minha && (
                  <Botao
                    titulo={editando ? 'Fechar' : 'Escolher animais'}
                    variante="oliva"
                    tamanho="pequeno"
                    onPress={() => setEditandoId(editando ? null : item._id)}
                    style={{ alignSelf: 'flex-start' }}
                  />
                )}
                {minha && editando && <EditarAnimais feira={item} onSalvo={() => { setEditandoId(null); carregar(); }} />}
              </CartaoLista>
            );
          }}
        />
      )}

      {ehOng && (
        <CadastrarFeira
          visivel={cadastrando}
          onFechar={() => setCadastrando(false)}
          onCriada={() => { setCadastrando(false); carregar(); }}
        />
      )}
    </View>
  );
}

const e = StyleSheet.create({
  lista: { padding: 16, gap: 16, paddingBottom: 32 },
  cadastrar: { alignSelf: 'center', width: '82%', marginBottom: 4 },
  agora: { fontFamily: fonte.titulo, fontSize: 14, color: '#1E7B34', marginTop: 2 },
  periodo: { fontSize: 14, marginTop: 4 },
  animais: { fontFamily: fonte.titulo, fontSize: 15, color: cores.preto, textAlign: 'right', marginTop: 8 },
});
