import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Image, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { api } from '../api';
import Icone from '../componentes/Icone';
import { capitalizar, rotuloIdade, solicitarAdocao, tentar } from '../componentes/util';
import { cores, fonte, sombra, texto } from '../tema';

// Animais que a pessoa pulou nesta sessão (voltam a aparecer quando ela toca na lupa).
const pulados = new Set();

function BotaoRedondo({ icone, cor, onPress, rotulo }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [e.redondo, pressed && { opacity: 0.8 }]} accessibilityRole="button" accessibilityLabel={rotulo}>
      <Icone nome={icone} tamanho={34} cor={cor} />
    </Pressable>
  );
}

/** Cartão que acompanha o dedo: direita = curtir, esquerda = pular. Os três botões fazem o mesmo. */
function CartaoDeslizante({ animal, largura, altura, onCurtir, onPular, onSolicitar }) {
  const pos = useRef(new Animated.ValueXY()).current;
  const acoes = useRef({});
  acoes.current = { onCurtir, onPular };
  const limite = largura * 0.3;

  function sair(direcao, depois) {
    Animated.timing(pos, { toValue: { x: direcao * largura * 1.4, y: 0 }, duration: 200, useNativeDriver: false }).start(depois);
  }
  function voltar() {
    Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
  }

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > limite) sair(1, () => acoes.current.onCurtir());
        else if (g.dx < -limite) sair(-1, () => acoes.current.onPular());
        else voltar();
      },
      onPanResponderTerminate: voltar,
    }),
  ).current;

  const rotacao = pos.x.interpolate({ inputRange: [-largura, 0, largura], outputRange: ['-14deg', '0deg', '14deg'] });
  const opacidadeCurtir = pos.x.interpolate({ inputRange: [0, limite], outputRange: [0, 1], extrapolate: 'clamp' });
  const opacidadePular = pos.x.interpolate({ inputRange: [-limite, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[e.cartao, sombra, { width: largura, height: altura, transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate: rotacao }] }]}
    >
      <Image
        source={require('../assets/imagens/filhote.png')}
        resizeMode="contain"
        style={{ width: largura, height: altura * 0.74 }}
        accessibilityLabel="Ilustração do animal"
      />

      <Animated.View style={[e.selo, { left: 20, opacity: opacidadeCurtir }]} pointerEvents="none">
        <Icone nome="curtir" tamanho={48} cor={cores.curtir} />
      </Animated.View>
      <Animated.View style={[e.selo, { right: 20, opacity: opacidadePular }]} pointerEvents="none">
        <Icone nome="fechar" tamanho={48} cor={cores.perigo} />
      </Animated.View>

      <View style={e.painel}>
        <Text style={e.nome} numberOfLines={1}>{animal.nome}</Text>
        <Text style={e.linha2}>{capitalizar(animal.especie)} - {rotuloIdade(animal.idade)}</Text>
        {!!animal.descricao && <Text style={e.descricao} numberOfLines={2}>{animal.descricao}</Text>}
        <View style={e.botoes}>
          <BotaoRedondo icone="curtir" cor={cores.curtir} rotulo="Curtir" onPress={() => sair(1, onCurtir)} />
          <BotaoRedondo icone="enviar" cor={cores.cinzaIcone} rotulo="Solicitar adoção" onPress={onSolicitar} />
          <BotaoRedondo icone="fechar" cor={cores.perigo} rotulo="Pular" onPress={() => sair(-1, onPular)} />
        </View>
      </View>
    </Animated.View>
  );
}

/** Estado vazio do layout: lupa preta e o cachorro espiando por baixo. */
function SemAnimais({ carregando, onBuscar }) {
  const { width } = useWindowDimensions();
  const cao = width * 0.74;
  return (
    <View style={e.vazio}>
      <Pressable onPress={onBuscar} disabled={carregando} style={e.lupa} accessibilityRole="button" accessibilityLabel="Buscar animais">
        {carregando ? <ActivityIndicator size="large" color={cores.branco} /> : <Icone nome="buscar" tamanho={68} cor="#F3F3F3" />}
      </Pressable>
      <Text style={[texto.dica, e.dica]}>
        {carregando ? 'Procurando novos amigos...' : 'Por enquanto é só!\nToque na lupa para buscar de novo.'}
      </Text>
      <Image
        source={require('../assets/imagens/cachorro-espiando.png')}
        style={{ position: 'absolute', right: -cao * 0.12, bottom: -cao * 0.14, width: cao, height: cao * (986 / 900) }}
      />
    </View>
  );
}

export default function Descobrir() {
  const { width } = useWindowDimensions();
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [fila, setFila] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async (limpar = false) => {
    if (limpar) pulados.clear();
    setCarregando(true);
    const r = await tentar(() => Promise.all([api.sugestoes(), api.animais(), api.favoritos(), api.enviadas()]));
    if (r) {
      const [sugestoes, todos, favoritos, enviadas] = r;
      // quem já foi favoritado, já recebeu pedido ou foi pulado não volta para a pilha
      const fora = new Set([...favoritos.map((a) => a._id), ...enviadas.map((s) => s.id_animal), ...pulados]);
      const vistos = new Set();
      setFila([...sugestoes, ...todos].filter((a) => {
        if (fora.has(a._id) || vistos.has(a._id)) return false;
        vistos.add(a._id);
        return true;
      }));
    }
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const tirar = (animal) => setFila((f) => f.filter((a) => a._id !== animal._id));

  function curtir(animal) {
    tirar(animal);
    api.curtir(animal._id).catch((erro) => {
      Alert.alert('Não foi possível curtir', erro.message);
      setFila((f) => [...f, animal]); // devolve para o fim da pilha
    });
  }

  function pular(animal) {
    pulados.add(animal._id);
    tirar(animal);
  }

  const larguraCartao = Math.min(width - 56, 360);
  const alturaCartao = Math.min(area.height - 28, larguraCartao * 1.65);
  const topo = fila[0];

  return (
    <View style={e.area} onLayout={(ev) => setArea(ev.nativeEvent.layout)}>
      {topo && area.height > 0 ? (
        <View style={{ width: larguraCartao, height: alturaCartao }}>
          {fila.length > 1 && <View style={[e.cartaoDeTras, { width: larguraCartao * 0.94, height: alturaCartao }]} />}
          <CartaoDeslizante
            key={topo._id}
            animal={topo}
            largura={larguraCartao}
            altura={alturaCartao}
            onCurtir={() => curtir(topo)}
            onPular={() => pular(topo)}
            onSolicitar={() => solicitarAdocao(topo, () => tirar(topo))}
          />
        </View>
      ) : (
        <SemAnimais carregando={carregando} onBuscar={() => carregar(true)} />
      )}
    </View>
  );
}

const e = StyleSheet.create({
  area: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cartao: { backgroundColor: cores.branco, borderRadius: 36, overflow: 'hidden' },
  cartaoDeTras: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -10,
    backgroundColor: cores.branco,
    opacity: 0.6,
    borderRadius: 36,
  },
  selo: { position: 'absolute', top: 24 },
  painel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.painel,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 18,
  },
  nome: { fontFamily: fonte.titulo, fontSize: 28, color: cores.branco },
  linha2: { fontSize: 19, color: cores.branco, fontWeight: '300', marginTop: 2 },
  descricao: { fontSize: 14, color: cores.branco, fontWeight: '300', marginTop: 6 },
  botoes: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 14 },
  redondo: { width: 56, height: 56, borderRadius: 28, backgroundColor: cores.branco, alignItems: 'center', justifyContent: 'center' },
  vazio: { flex: 1, alignSelf: 'stretch', alignItems: 'center', paddingTop: 56, overflow: 'hidden' },
  lupa: { width: 130, height: 130, borderRadius: 65, backgroundColor: cores.preto, alignItems: 'center', justifyContent: 'center' },
  dica: { marginTop: 20, paddingHorizontal: 32 },
});
