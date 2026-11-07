import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as sql from 'mssql';
import { Feira, NovaFeira } from '../domain/feira';
import { FeiraRepository } from '../domain/feira.repository';
import { caixaDelimitadora, distanciaKm } from '../domain/localizacao';
import { ConexaoSql } from './conexao-sql';

type Linha = {
  id: string; nome: string; descricao: string | null; endereco: string;
  latitude: number; longitude: number; data_inicio: Date; data_fim: Date;
  id_ong: string; id_animal: string | null;
};

const SELECT_FEIRAS = `
  SELECT f.id, f.nome, f.descricao, f.endereco, f.latitude, f.longitude,
         f.data_inicio, f.data_fim, f.id_ong, a.id_animal
  FROM dbo.feiras f
  LEFT JOIN dbo.feira_animais a ON a.id_feira = f.id`;

/** Adaptador da porta FeiraRepository para o Azure SQL (biblioteca `mssql`, consultas parametrizadas). */
@Injectable()
export class FeiraSqlRepository implements FeiraRepository {
  constructor(private conexao: ConexaoSql) {}

  /** Uma feira por vez, com os animais: o JOIN devolve uma linha por animal e aqui juntamos de volta. */
  private agrupar(linhas: Linha[]): Feira[] {
    const porId = new Map<string, Feira>();
    for (const l of linhas) {
      const id = l.id.toLowerCase(); // o SQL devolve o GUID em maiúsculas
      let feira = porId.get(id);
      if (!feira) {
        feira = new Feira(
          id, l.nome, l.descricao ?? undefined, l.endereco, l.latitude, l.longitude,
          l.data_inicio, l.data_fim, l.id_ong, [],
        );
        porId.set(id, feira);
      }
      if (l.id_animal) feira.animais.push(l.id_animal);
    }
    return [...porId.values()];
  }

  private async consultar(where: string, parametros: (r: sql.Request) => void) {
    const r = (await this.conexao.obterPool()).request();
    parametros(r);
    const { recordset } = await r.query<Linha>(`${SELECT_FEIRAS} ${where} ORDER BY f.data_inicio, f.id`);
    return this.agrupar(recordset);
  }

  private inserirAnimais(r: sql.Request, idFeira: string, animais: string[]) {
    if (!animais.length) return Promise.resolve();
    r.input('idFeira', sql.UniqueIdentifier, idFeira);
    const valores = animais.map((a, i) => {
      r.input(`animal${i}`, sql.VarChar(64), a);
      return `(@idFeira, @animal${i})`;
    });
    return r.query(`INSERT INTO dbo.feira_animais (id_feira, id_animal) VALUES ${valores.join(', ')}`);
  }

  async criar(n: NovaFeira) {
    const id = randomUUID();
    await this.conexao.emTransacao(async (nova) => {
      await nova()
        .input('id', sql.UniqueIdentifier, id)
        .input('nome', sql.NVarChar(100), n.nome)
        .input('descricao', sql.NVarChar(500), n.descricao ?? null)
        .input('endereco', sql.NVarChar(200), n.endereco)
        .input('latitude', sql.Float, n.latitude)
        .input('longitude', sql.Float, n.longitude)
        .input('inicio', sql.DateTime2(3), n.dataInicio)
        .input('fim', sql.DateTime2(3), n.dataFim)
        .input('idOng', sql.VarChar(64), n.idOng)
        .query(`INSERT INTO dbo.feiras (id, nome, descricao, endereco, latitude, longitude, data_inicio, data_fim, id_ong)
                VALUES (@id, @nome, @descricao, @endereco, @latitude, @longitude, @inicio, @fim, @idOng)`);
      await this.inserirAnimais(nova(), id, n.animais);
    });
    return new Feira(id, n.nome, n.descricao, n.endereco, n.latitude, n.longitude, n.dataInicio, n.dataFim, n.idOng, [...n.animais]);
  }

  async buscarPorId(id: string) {
    const [feira] = await this.consultar('WHERE f.id = @id', (r) => r.input('id', sql.UniqueIdentifier, id));
    return feira ?? null;
  }

  async salvar(feira: Feira) {
    await this.conexao.emTransacao(async (nova) => {
      await nova()
        .input('id', sql.UniqueIdentifier, feira.id)
        .input('nome', sql.NVarChar(100), feira.nome)
        .input('descricao', sql.NVarChar(500), feira.descricao ?? null)
        .input('endereco', sql.NVarChar(200), feira.endereco)
        .input('latitude', sql.Float, feira.latitude)
        .input('longitude', sql.Float, feira.longitude)
        .input('inicio', sql.DateTime2(3), feira.dataInicio)
        .input('fim', sql.DateTime2(3), feira.dataFim)
        .query(`UPDATE dbo.feiras
                SET nome = @nome, descricao = @descricao, endereco = @endereco, latitude = @latitude,
                    longitude = @longitude, data_inicio = @inicio, data_fim = @fim
                WHERE id = @id`);
      await nova().input('id', sql.UniqueIdentifier, feira.id).query('DELETE FROM dbo.feira_animais WHERE id_feira = @id');
      await this.inserirAnimais(nova(), feira.id, feira.animais);
    });
  }

  async excluir(id: string) {
    // os animais da feira saem junto (ON DELETE CASCADE)
    await (await this.conexao.obterPool()).request().input('id', sql.UniqueIdentifier, id).query('DELETE FROM dbo.feiras WHERE id = @id');
  }

  listarAtivas(agora: Date) {
    return this.consultar('WHERE f.data_fim >= @agora', (r) => r.input('agora', sql.DateTime2(3), agora));
  }

  async listarProximas(lat: number, lng: number, raioKm: number, agora: Date) {
    // o banco filtra pelo retângulo (usa o índice); o Haversine descarta os cantos e ordena por distância
    // (a caixa não considera a virada do meridiano 180°, o que não afeta o uso no Brasil)
    const c = caixaDelimitadora(lat, lng, raioKm);
    const candidatas = await this.consultar(
      `WHERE f.data_fim >= @agora AND f.latitude BETWEEN @latMin AND @latMax AND f.longitude BETWEEN @lngMin AND @lngMax`,
      (r) =>
        r.input('agora', sql.DateTime2(3), agora)
          .input('latMin', sql.Float, c.latMin).input('latMax', sql.Float, c.latMax)
          .input('lngMin', sql.Float, c.lngMin).input('lngMax', sql.Float, c.lngMax),
    );
    return candidatas
      .map((feira) => ({ feira, d: distanciaKm(lat, lng, feira.latitude, feira.longitude) }))
      .filter((x) => x.d <= raioKm)
      .sort((a, b) => a.d - b.d)
      .slice(0, 100)
      .map((x) => x.feira);
  }

  async excluirDaOng(idOng: string) {
    await (await this.conexao.obterPool()).request().input('idOng', sql.VarChar(64), idOng).query('DELETE FROM dbo.feiras WHERE id_ong = @idOng');
  }
}
