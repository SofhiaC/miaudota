import React, { useEffect, useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';
import { CardAnimal, tentar, Vazio } from '../componentes';

function FormAnimal({ onCriado }) {
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');

  async function salvar() {
    const dados = { nome, especie, idade: Number(idade), ...(descricao ? { descricao } : {}) };
    const r = await tentar(() => api.criarAnimal(dados), 'Animal cadastrado!');
    if (r) onCriado();
  }

  return (
    <View style={s.box}>
      <TextInput style={s.input} placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput style={s.input} placeholder="Espécie (cachorro, gato...)" value={especie} onChangeText={setEspecie} />
      <TextInput style={s.input} placeholder="Idade (anos)" keyboardType="numeric" value={idade} onChangeText={setIdade} />
      <TextInput style={s.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
      <Button title="Salvar" onPress={salvar} />
    </View>
  );
}

export default function MeusAnimais() {
  const [lista, setLista] = useState([]);
  const [cadastrando, setCadastrando] = useState(false);

  const carregar = async () => { const r = await tentar(() => api.meusAnimais()); if (r) setLista(r); };
  useEffect(() => { carregar(); }, []);

  return (
    <FlatList
      data={lista}
      keyExtractor={(a) => a._id}
      ListHeaderComponent={
        <View>
          <Button title={cadastrando ? 'Cancelar' : '+ Cadastrar animal'} onPress={() => setCadastrando(!cadastrando)} />
          {cadastrando && <FormAnimal onCriado={() => { setCadastrando(false); carregar(); }} />}
        </View>
      }
      ListEmptyComponent={<Vazio texto="Você ainda não cadastrou animais" />}
      renderItem={({ item }) => (
        <CardAnimal animal={item}>
          <Text style={item.disponivel ? s.verde : s.rotulo}>{item.disponivel ? 'Disponível' : 'Adotado / indisponível'}</Text>
        </CardAnimal>
      )}
    />
  );
}
