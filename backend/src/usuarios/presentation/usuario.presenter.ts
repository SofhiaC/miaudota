import { Usuario } from '../domain/usuario';

export const usuarioParaJson = (u: Usuario) => ({ _id: u.id, nome: u.nome, email: u.email, tipo: u.tipo });
