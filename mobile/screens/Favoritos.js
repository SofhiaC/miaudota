import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CartaoLista from '../componentes/CartaoLista';
import Carregando from '../componentes/Carregando';
import Vazio from '../componentes/Vazio';
import { capitalizar, rotuloIdade, solicitarAdocao, tentar } from '../componentes/util';

export default function Favoritos() {
  const [lista, setLista] = useState(null);

  const carregar = useCallback(async () => {
    const r = await tentar(() => api.favoritos());
    setLista(r ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function remover(animal) {
    await tentar(() => api.descurtir(animal._id));
    carregar();
  }

  if (lista === null) return <Carregando />;

  return (
    <FlatList
      data={lista}
      keyExtractor={(a) => a._id}
      contentContainerStyle={e.lista}
      ListEmptyComponent={<Vazio texto={'Nenhum favorito ainda.\nCurta um bichinho na aba do meio!'} />}
      renderItem={({ item }) => (
        <CartaoLista
          titulo={item.nome}
          linha2={`${capitalizar(item.especie)} - ${rotuloIdade(item.idade)}`}
          linha3={item.descricao}
          rodape={
            <View style={e.botoes}>
              <Botao titulo="Remover" variante="remover" tamanho="pequeno" onPress={() => remover(item)} />
              <Botao
                titulo="Solicitar Adoção"
                variante="oliva"
                tamanho="pequeno"
                desabilitado={!item.disponivel}
                onPress={() => solicitarAdocao(item)}
              />
            </View>
          }
        />
      )}
    />
  );
}

const e = StyleSheet.create({
  lista: { padding: 16, gap: 16, paddingBottom: 32 },
  botoes: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
});
