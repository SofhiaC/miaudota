/** Distância em km entre duas coordenadas (fórmula de Haversine). */
export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Retângulo (em graus) que contém o círculo de busca. O banco usa o retângulo para filtrar rápido
 * e o Haversine acima tira os cantos que ficam fora do raio.
 */
export function caixaDelimitadora(lat: number, lng: number, raioKm: number) {
  const KM_POR_GRAU = 111.32;
  const dLat = raioKm / KM_POR_GRAU;
  const cos = Math.max(Math.cos((lat * Math.PI) / 180), 0.01); // evita divisão por ~0 perto dos polos
  const dLng = raioKm / (KM_POR_GRAU * cos);
  return { latMin: lat - dLat, latMax: lat + dLat, lngMin: lng - dLng, lngMax: lng + dLng };
}
