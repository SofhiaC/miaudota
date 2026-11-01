import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CampoDeTexto from '../componentes/CampoDeTexto';
import CartaoLista from '../componentes/CartaoLista';
import Carregando from '../componentes/Carregando';
import Formulario from '../componentes/Formulario';
import Vazio from '../componentes/Vazio';
import { capitalizar, rotuloIdade, tentar } from '../componentes/util';
import { cores, fonte } from '../tema';

function FormularioAnimal({ visivel, onFechar, onCriado }) {
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('');
  const [idade, setIdade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const dados = { nome, especie, idade: Number(idade), ...(descricao ? { descricao } : {}) };
    const r = await tentar(() => api.criarAnimal(dados), 'Animal cadastrado!');
    setSalvando(false);
    if (r) {
      setNome(''); setEspecie(''); setIdade(''); setDescricao('');
      onCriado();
    }
  }

  return (
    <Formulario visivel={visivel} titulo="Cadastrar animal" onFechar={onFechar}>
      <CampoDeTexto rotulo="Nome" icone="nome" value={nome} onChangeText={setNome} autoCapitalize="words" />
      <CampoDeTexto rotulo="Espécie" icone="especie" value={especie} onChangeText={setEspecie} placeholder="cachorro, gato..." />
      <CampoDeTexto rotulo="Idade (em anos)" icone="idade" value={idade} onChangeText={setIdade} keyboardType="numeric" placeholder="0 se tiver menos de 1 ano" />
      <CampoDeTexto rotulo="Descrição" icone="descricao" value={descricao} onChangeText={setDescricao} multiline />
      <Botao titulo="Salvar" variante="escuroAmarelo" onPress={salvar} carregando={salvando} style={{ marginTop: 10 }} />
    </Formulario>
  );
}

export default function MeusAnimais() {
  const [lista, setLista] = useState(null);
  const [cadastrando, setCadastrando] = useState(false);

  const carregar = useCallback(async () => {
    const r = await tentar(() => api.meusAnimais());
    setLista(r ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  return (
    <View style={{ flex: 1 }}>
      {lista === null ? (
        <Carregando />
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(a) => a._id}
          contentContainerStyle={e.lista}
          ListHeaderComponent={<Botao titulo="Cadastrar Animal" onPress={() => setCadastrando(true)} style={e.cadastrar} />}
          ListEmptyComponent={<Vazio texto="Você ainda não cadastrou nenhum animal." />}
          renderItem={({ item }) => (
            <CartaoLista
              titulo={item.nome}
              linha2={`${capitalizar(item.especie)} - ${rotuloIdade(item.idade)}`}
              linha3={item.descricao}
              rodape={
                <Text style={[e.status, { color: item.disponivel ? cores.preto : cores.cinzaIcone }]}>
                  {item.disponivel ? 'Disponível' : 'Adotado'}
                </Text>
              }
            />
          )}
        />
      )}
      <FormularioAnimal
        visivel={cadastrando}
        onFechar={() => setCadastrando(false)}
        onCriado={() => { setCadastrando(false); carregar(); }}
      />
    </View>
  );
}

const e = StyleSheet.create({
  lista: { padding: 16, gap: 16, paddingBottom: 32 },
  cadastrar: { alignSelf: 'center', width: '82%', marginBottom: 4 },
  status: { fontFamily: fonte.titulo, fontSize: 16, textAlign: 'right', marginTop: 8 },
});
