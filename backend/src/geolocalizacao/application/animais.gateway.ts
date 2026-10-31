/**
 * Porta para falar com o serviço de adoção. A feira só guarda ids de animais;
 * quem monta os dados completos para a tela é o BFF.
 */
export abstract class AnimaisGateway {
  abstract contarDisponiveisDoDono(idDono: string, ids: string[]): Promise<number>;
}
