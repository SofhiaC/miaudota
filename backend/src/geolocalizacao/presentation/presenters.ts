import { FeiraComAnimais } from '../application/montar-visao-das-feiras';

/** `animais` sai como lista de ids; o BFF troca pelos dados completos antes de responder ao app. */
export const feiraParaJson = (v: FeiraComAnimais) => ({
  _id: v.feira.id,
  nome: v.feira.nome,
  descricao: v.feira.descricao,
  endereco: v.feira.endereco,
  latitude: v.feira.latitude,
  longitude: v.feira.longitude,
  dataInicio: v.feira.dataInicio,
  dataFim: v.feira.dataFim,
  id_ong: v.feira.idOng,
  animais: v.animais,
  acontecendoAgora: v.feira.acontecendoAgora(),
  distanciaKm: v.distanciaKm,
});
