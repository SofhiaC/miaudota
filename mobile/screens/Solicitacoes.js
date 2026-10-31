import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';
import { tentar, Vazio } from '../componentes';

const ROTULO = { PENDENTE: '⏳ Pendente', APROVADA: '✅ Aprovada', RECUSADA: '❌ Recusada' };

export default function Solicitacoes({ usuario }) {
  const ong = usuario.tipo === 'ONG'; // ONG não adota: só recebe pedidos nos seus animais
  const [modo, setModo] = useState(ong ? 'recebidos' : 'enviados'); // 'enviados' | 'recebidos'
  const [lista, setLista] = useState([]);
  const recebidos = modo === 'recebidos';

  async function carregar(m = modo) {
    const r = await tentar(() => (m === 'recebidos' ? api.recebidas() : api.enviadas()));
    if (r) setLista(r);
  }
  useEffect(() => { setLista([]); carregar(modo); }, [modo]);

  async function responder(id, status) {
    await tentar(() => api.responderSolicitacao(id, status));
    carregar();
  }

  return (
    <View style={{ flex: 1 }}>
      {!ong && (
        <View style={s.linha}>
          <Button title="Enviados por mim" color={!recebidos ? 'green' : 'gray'} onPress={() => setModo('enviados')} />
          <Button title="Recebidos" color={recebidos ? 'green' : 'gray'} onPress={() => setModo('recebidos')} />
        </View>
      )}
      <FlatList
        data={lista}
        keyExtractor={(x) => x._id}
        ListEmptyComponent={
          <Vazio texto={recebidos ? 'Ninguém solicitou seus animais ainda' : 'Você ainda não solicitou nenhuma adoção'} />
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.nome}>{item.animalNome ?? 'Animal removido'}</Text>
            <Text>{ROTULO[item.status]}</Text>
            {recebidos && item.adotante && <Text style={s.rotulo}>{item.adotante.nome} · {item.adotante.email}</Text>}
            {recebidos && item.status === 'PENDENTE' && (
              <View style={s.linha}>
                <Button title="Aprovar" color="green" onPress={() => responder(item._id, 'APROVADA')} />
                <Button title="Recusar" color="red" onPress={() => responder(item._id, 'RECUSADA')} />
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}
