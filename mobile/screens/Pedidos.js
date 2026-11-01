import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CartaoLista from '../componentes/CartaoLista';
import Carregando from '../componentes/Carregando';
import SubAbas from '../componentes/SubAbas';
import Vazio from '../componentes/Vazio';
import { capitalizar, rotuloIdade, tentar } from '../componentes/util';
import { cores, fonte, texto } from '../tema';

const STATUS = { PENDENTE: 'Aguardando Retorno', APROVADA: 'Aprovada', RECUSADA: 'Recusada' };
const COR_STATUS = { PENDENTE: cores.preto, APROVADA: '#1E7B34', RECUSADA: cores.perigo };

export default function Pedidos({ usuario }) {
  const ong = usuario.tipo === 'ONG'; // ONG não adota: só recebe pedidos nos seus animais
  const [modo, setModo] = useState(ong ? 'recebidos' : 'enviados');
  const [lista, setLista] = useState(null);
  const recebidos = modo === 'recebidos';

  const carregar = useCallback(async (m) => {
    const r = await tentar(() => (m === 'recebidos' ? api.recebidas() : api.enviadas()));
    setLista(r ?? []);
  }, []);

  useEffect(() => {
    setLista(null);
    carregar(modo);
  }, [modo, carregar]);

  async function responder(id, status) {
    await tentar(() => api.responderSolicitacao(id, status));
    carregar(modo);
  }

  return (
    <View style={{ flex: 1 }}>
      {!ong && (
        <SubAbas
          opcoes={[{ id: 'enviados', rotulo: 'Enviados por Mim' }, { id: 'recebidos', rotulo: 'Recebidos' }]}
          atual={modo}
          onSelecionar={setModo}
        />
      )}
      {lista === null ? (
        <Carregando />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(s) => s._id}
          contentContainerStyle={e.lista}
          ListEmptyComponent={
            <Vazio texto={recebidos ? 'Ninguém pediu seus animais ainda.' : 'Você ainda não pediu nenhuma adoção.'} />
          }
          renderItem={({ item }) => {
            const animal = item.animal;
            return (
              <CartaoLista
                titulo={item.animalNome ?? 'Animal removido'}
                linha2={animal ? `${capitalizar(animal.especie)} - ${rotuloIdade(animal.idade)}` : undefined}
                linha3={animal?.descricao}
                rodape={
                  <>
                    {recebidos && item.adotante && (
                      <Text style={[texto.corpo, e.contato]} numberOfLines={2}>
                        {item.adotante.nome} · {item.adotante.email}
                      </Text>
                    )}
                    {recebidos && item.status === 'PENDENTE' ? (
                      <View style={e.botoes}>
                        <Botao titulo="Recusar" variante="remover" tamanho="pequeno" onPress={() => responder(item._id, 'RECUSADA')} />
                        <Botao titulo="Aprovar" variante="oliva" tamanho="pequeno" onPress={() => responder(item._id, 'APROVADA')} />
                      </View>
                    ) : (
                      <Text style={[e.status, { color: COR_STATUS[item.status] }]}>{STATUS[item.status]}</Text>
                    )}
                  </>
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}

const e = StyleSheet.create({
  lista: { padding: 16, gap: 16, paddingBottom: 32 },
  status: { fontFamily: fonte.titulo, fontSize: 16, textAlign: 'right', marginTop: 8 },
  contato: { marginTop: 4 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
});
