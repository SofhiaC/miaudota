import { Feira, NovaFeira } from './feira';

export abstract class FeiraRepository {
  abstract criar(dados: NovaFeira): Promise<Feira>;
  abstract buscarPorId(id: string): Promise<Feira | null>;
  /** Grava os dados e a lista de animais da feira (atualização completa). */
  abstract salvar(feira: Feira): Promise<void>;
  abstract excluir(id: string): Promise<void>;
  abstract listarAtivas(agora: Date): Promise<Feira[]>;
  /** Feiras que ainda não terminaram dentro do raio, da mais próxima para a mais distante. */
  abstract listarProximas(lat: number, lng: number, raioKm: number, agora: Date): Promise<Feira[]>;
  abstract excluirDaOng(idOng: string): Promise<void>;
}
