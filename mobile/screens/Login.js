import React, { useState } from 'react';
import { Alert, Button, Switch, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { s } from '../estilos';

export default function Login({ onEntrar }) {
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('PESSOA');
  const [consentimento, setConsentimento] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setEnviando(true);
    try {
      const resposta = cadastro
        ? await api.cadastrar({ nome, email, senha, tipo, consentimentoLgpd: consentimento })
        : await api.login(email, senha);
      await onEntrar(resposta);
    } catch (e) {
      Alert.alert('Erro', e.message);
      setEnviando(false);
    }
  }

  return (
    <View style={s.box}>
      <Text style={s.titulo}>Miaudota 🐾</Text>
      {cadastro && <TextInput style={s.input} placeholder="Nome" value={nome} onChangeText={setNome} />}
      <TextInput style={s.input} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Senha (mín. 8 caracteres)" secureTextEntry value={senha} onChangeText={setSenha} />
      {cadastro && (
        <>
          <View style={s.linha}>
            <Button title="Sou pessoa" color={tipo === 'PESSOA' ? 'green' : 'gray'} onPress={() => setTipo('PESSOA')} />
            <Button title="Sou ONG" color={tipo === 'ONG' ? 'green' : 'gray'} onPress={() => setTipo('ONG')} />
          </View>
          <View style={s.linha}>
            <Switch value={consentimento} onValueChange={setConsentimento} />
            <Text style={{ flex: 1, marginLeft: 8 }}>
              Concordo com o tratamento dos meus dados pessoais conforme a LGPD
            </Text>
          </View>
        </>
      )}
      <Button title={cadastro ? 'Cadastrar' : 'Entrar'} onPress={enviar} disabled={enviando} />
      <Button title={cadastro ? 'Já tenho conta' : 'Criar conta'} onPress={() => setCadastro(!cadastro)} />
    </View>
  );
}
