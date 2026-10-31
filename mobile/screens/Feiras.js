import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../api';
import { s } from '../estilos';
import { tentar, Vazio } from '../componentes';
import CadastrarFeira from './CadastrarFeira';
import SeletorAnimais from './SeletorAnimais';

const BRASIL = { latitude: -14.2, longitude: -51.9, latitudeDelta: 40, longitudeDelta: 40 };
const fmt = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// No emulador sem localização definida a posição nunca chega; sem isso o spinner ficava eterno.
const comTimeout = (promessa, ms) =>
  Promise.race([promessa, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

function EditarAnimais({ feira, onSalvo }) {
  const [ids, setIds] = useState(feira.animais.map((a) => a._id));

  async function salvar() {
    const r = await tentar(() => api.definirAnimaisFeira(feira._id, ids), 'Animais da feira atualizados!');
    if (r) onSalvo();
  }

  return (
    <View style={{ gap: 8 }}>
      <SeletorAnimais selecionados={ids} onChange={setIds} />
      <Button title="Salvar animais" onPress={salvar} />
    </View>
  );
}

export default function Feiras({ usuario }) {
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

  if (!carregado) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const regiao = posicao
    ? { latitude: posicao.lat, longitude: posicao.lng, latitudeDelta: 0.3, longitudeDelta: 0.3 }
    : feiras[0]
      ? { latitude: feiras[0].latitude, longitude: feiras[0].longitude, latitudeDelta: 0.3, longitudeDelta: 0.3 }
      : BRASIL;

  const ehOng = usuario.tipo === 'ONG';

  return (
    <View style={{ flex: 1 }}>
      <MapView style={s.mapa} initialRegion={regiao} showsUserLocation={!!posicao}>
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

      <FlatList
        data={feiras}
        extraData={editandoId}
        keyExtractor={(f) => f._id}
        ListHeaderComponent={
          ehOng ? (
            <View>
              <Button title={cadastrando ? 'Cancelar' : '+ Cadastrar feira'} onPress={() => setCadastrando(!cadastrando)} />
              {cadastrando && <CadastrarFeira onCriada={() => { setCadastrando(false); carregar(); }} />}
            </View>
          ) : null
        }
        ListEmptyComponent={<Vazio texto="Nenhuma feira por perto" />}
        renderItem={({ item }) => {
          const minha = ehOng && item.id_ong === usuario._id;
          const editando = editandoId === item._id;
          return (
            <View style={s.card}>
              <Text style={s.nome}>{item.nome}</Text>
              {item.acontecendoAgora && <Text style={s.verde}>🟢 Acontecendo agora</Text>}
              <Text>{item.endereco}</Text>
              {!!item.descricao && <Text>{item.descricao}</Text>}
              <Text style={s.rotulo}>{fmt(item.dataInicio)} → {fmt(item.dataFim)}</Text>
              {item.distanciaKm != null && <Text style={s.rotulo}>{item.distanciaKm} km de você</Text>}
              {item.animais.length > 0 && (
                <Text>🐾 {item.animais.map((a) => `${a.nome} (${a.especie})`).join(', ')}</Text>
              )}
              {minha && (
                <Button
                  title={editando ? 'Fechar' : 'Escolher animais'}
                  onPress={() => setEditandoId(editando ? null : item._id)}
                />
              )}
              {minha && editando && (
                <EditarAnimais feira={item} onSalvo={() => { setEditandoId(null); carregar(); }} />
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
