export type NivelOportunidade = 'BAIXA' | 'MEDIA' | 'ALTA';

export type IndicadorAdocao = {
  animaisDisponiveis: number;
  feirasAtivas: number;
  animaisPorFeira: number | null;
  pontuacao: number;
  nivel: NivelOportunidade;
  mensagem: string;
  geradoEm: string;
};

const MENSAGENS: Record<NivelOportunidade, string> = {
  ALTA: 'Ótimo momento para adotar: há muitos animais e feiras acontecendo.',
  MEDIA: 'Há opções de animais e feiras; vale acompanhar as próximas feiras.',
  BAIXA: 'Poucas opções no momento; volte em breve ou publique um animal.',
};

/**
 * Enriquecimento dos dados agregados pelo BFF: transforma duas contagens em um "índice de oportunidade de adoção".
 * Cada feira ativa vale 12 pontos (até 5 feiras) e cada animal disponível vale 1 ponto (até 40 animais): máximo 100.
 * Função pura, sem acesso a banco ou rede.
 */
export function calcularIndicador(animaisDisponiveis: number, feirasAtivas: number, agora = new Date()): IndicadorAdocao {
  const pontuacao = Math.min(feirasAtivas, 5) * 12 + Math.min(animaisDisponiveis, 40);
  const nivel: NivelOportunidade = pontuacao >= 70 ? 'ALTA' : pontuacao >= 35 ? 'MEDIA' : 'BAIXA';
  const animaisPorFeira = feirasAtivas > 0 ? Math.round((animaisDisponiveis / feirasAtivas) * 10) / 10 : null;
  return {
    animaisDisponiveis,
    feirasAtivas,
    animaisPorFeira,
    pontuacao,
    nivel,
    mensagem: MENSAGENS[nivel],
    geradoEm: agora.toISOString(),
  };
}
