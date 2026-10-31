import React, { useEffect, useState } from 'react';
import { Button, FlatList, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';
import { CardAnimal, tentar, Vazio } from '../componentes';

export default function Favoritos() {
  const [lista, setLista] = useState([]);

  const carregar = async () => { const r = await tentar(() => api.favoritos()); if (r) setLista(r); };
  useEffect(() => { carregar(); }, []);

  return (
    <FlatList
      data={lista}
      keyExtractor={(a) => a._id}
      ListEmptyComponent={<Vazio texto="Nenhum favorito ainda" />}
      renderItem={({ item }) => (
        <CardAnimal animal={item}>
          <View style={s.linha}>
            <Button title="Remover" color="gray" onPress={async () => { await tentar(() => api.descurtir(item._id)); carregar(); }} />
            <Button
              title="Solicitar adoção"
              disabled={!item.disponivel}
              onPress={() => tentar(() => api.solicitar(item._id), 'Solicitação enviada!')}
            />
          </View>
        </CardAnimal>
      )}
    />
  );
}
