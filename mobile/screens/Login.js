import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import Botao from '../componentes/Botao';
import CampoDeTexto from '../componentes/CampoDeTexto';
import Caixa from '../componentes/Caixa';
import { cores, fonte, texto } from '../tema';

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
    <KeyboardAvoidingView style={e.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
        <Image source={require('../assets/imagens/mascote.png')} style={e.mascote} accessibilityLabel="Mascote do Miaudota" />
        <Text style={[texto.logo, e.logo]}>miaudota</Text>

        <View style={e.formulario}>
          {cadastro && <CampoDeTexto rotulo="Nome" icone="pessoa" value={nome} onChangeText={setNome} autoCapitalize="words" />}
          <CampoDeTexto
            rotulo="E-mail"
            icone="email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          <CampoDeTexto
            rotulo="Senha"
            icone="senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder={cadastro ? 'mínimo de 8 caracteres' : undefined}
          />

          {cadastro && (
            <>
              <View>
                <Text style={texto.rotulo}>Quem é você?</Text>
                <View style={e.tipos}>
                  <Botao titulo="Pessoa" tamanho="pequeno" variante={tipo === 'PESSOA' ? 'escuro' : 'claro'} onPress={() => setTipo('PESSOA')} style={e.tipo} />
                  <Botao titulo="ONG" tamanho="pequeno" variante={tipo === 'ONG' ? 'escuro' : 'claro'} onPress={() => setTipo('ONG')} style={e.tipo} />
                </View>
              </View>
              <Caixa marcado={consentimento} onAlternar={() => setConsentimento(!consentimento)}>
                Concordo com o tratamento dos meus dados pessoais conforme a LGPD
              </Caixa>
            </>
          )}

          <Botao
            titulo={cadastro ? 'Cadastrar' : 'Entrar'}
            variante="escuroAmarelo"
            onPress={enviar}
            carregando={enviando}
            style={e.botao}
          />

          <Pressable onPress={() => setCadastro(!cadastro)} hitSlop={10} accessibilityRole="button">
            <Text style={e.alternar}>{cadastro ? 'Já tenho conta' : 'Criar conta'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 36, paddingTop: 56, paddingBottom: 40 },
  mascote: { width: 130, height: 130 * (613 / 480) },
  logo: { marginTop: 8, marginBottom: 28 },
  formulario: { width: '100%', maxWidth: 420, gap: 14 },
  tipos: { flexDirection: 'row', gap: 10 },
  tipo: { flex: 1 },
  botao: { marginTop: 10 },
  alternar: { fontFamily: fonte.titulo, fontSize: 17, color: cores.escuro, textAlign: 'center', textDecorationLine: 'underline', marginTop: 4 },
});
