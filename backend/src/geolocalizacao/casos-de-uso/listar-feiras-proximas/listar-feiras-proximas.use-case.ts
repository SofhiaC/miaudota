import { Injectable } from '@nestjs/common';
import { MontarVisaoDasFeiras } from '../../application/montar-visao-das-feiras';
import { FeiraRepository } from '../../domain/feira.repository';

@Injectable()
export class ListarFeirasProximas {
  constructor(private feiras: FeiraRepository, private montar: MontarVisaoDasFeiras) {}

  async executar(lat: number, lng: number, raioKm = 50) {
    const feiras = await this.feiras.listarProximas(lat, lng, raioKm, new Date());
    return this.montar.executar(feiras, { lat, lng });
  }
}
