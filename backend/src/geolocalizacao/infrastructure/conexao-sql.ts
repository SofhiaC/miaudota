import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as sql from 'mssql';
import { configSql } from '../../shared/config';
import { DDL_FEIRAS } from './feira.sql-schema';

/**
 * Conexão (pool) com o Azure SQL. Fica na infraestrutura: o domínio e os casos de uso nunca a enxergam,
 * só o FeiraSqlRepository. Ao subir, garante que as tabelas existam (script idempotente).
 */
@Injectable()
export class ConexaoSql implements OnModuleInit, OnModuleDestroy {
  private readonly log = new Logger('ConexaoSql');
  private pool?: sql.ConnectionPool;

  async onModuleInit() {
    await this.obterPool();
    await this.criarEsquema();
  }

  async onModuleDestroy() {
    await this.pool?.close();
  }

  async obterPool(): Promise<sql.ConnectionPool> {
    if (this.pool?.connected) return this.pool;
    const c = configSql();
    if (c.criarBanco) await this.criarBancoSeNaoExistir(c);
    this.pool = await this.conectarComTentativas(this.configuracao(c, c.database));
    this.log.log(`Conectado ao SQL (${c.server}/${c.database})`);
    return this.pool;
  }

  /** Executa várias instruções na mesma transação; desfaz tudo se alguma falhar. */
  async emTransacao<T>(trabalho: (novaRequisicao: () => sql.Request) => Promise<T>): Promise<T> {
    const tx = new sql.Transaction(await this.obterPool());
    await tx.begin();
    try {
      const resultado = await trabalho(() => new sql.Request(tx));
      await tx.commit();
      return resultado;
    } catch (erro) {
      await tx.rollback().catch(() => undefined);
      throw erro;
    }
  }

  private async conectarComTentativas(config: sql.config, tentativas = 4): Promise<sql.ConnectionPool> {
    for (let i = 1; ; i++) {
      try {
        return await new sql.ConnectionPool(config).connect();
      } catch (erro) {
        if (i >= tentativas) throw erro;
        this.log.warn(`Falha ao conectar (tentativa ${i}/${tentativas}); o banco serverless pode estar acordando. Tentando de novo...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  private configuracao(c: ReturnType<typeof configSql>, banco: string): sql.config {
    return {
      server: c.server,
      port: c.port,
      database: banco,
      user: c.user,
      password: c.password,
      options: { encrypt: c.encrypt, trustServerCertificate: c.trustServerCertificate },
      // o Azure SQL gratuito é serverless: depois de pausado, a primeira conexão pode levar mais de 15s para acordar
      connectionTimeout: 60000,
      requestTimeout: 30000,
      pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
    };
  }

  private async criarBancoSeNaoExistir(c: ReturnType<typeof configSql>) {
    const mestre = await new sql.ConnectionPool(this.configuracao(c, 'master')).connect();
    try {
      await mestre
        .request()
        .input('nome', sql.NVarChar(128), c.database)
        .query(`IF DB_ID(@nome) IS NULL EXEC('CREATE DATABASE [' + REPLACE(@nome, ']', ']]') + ']')`);
    } finally {
      await mestre.close();
    }
  }

  private async criarEsquema() {
    const pool = await this.obterPool();
    for (const comando of DDL_FEIRAS) await pool.request().batch(comando);
  }
}
