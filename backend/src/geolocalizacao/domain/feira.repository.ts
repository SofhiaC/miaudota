import { Feira, NovaFeira } from './feira';

export abstract class FeiraRepository {
  abstract criar(dados: NovaFeira): Promise<Feira>;
  abstract buscarPorId(id: string): Promise<Feira | null>;
  abstract salvar(feira: Feira): Promise<void>;
  abstract listarAtivas(agora: Date): Promise<Feira[]>;
  abstract listarProximas(lat: number, lng: number, raioKm: number, agora: Date): Promise<Feira[]>;
  abstract excluirDaOng(idOng: string): Promise<void>;
}
