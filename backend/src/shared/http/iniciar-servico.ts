import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FiltroDeExcecoes } from './filtro-excecoes';

/** Sobe um dos processos do sistema (cada serviço, o BFF e o gateway usam o mesmo roteiro). */
export async function iniciarServico(modulo: any, nome: string, porta: number, opcoes: { cors?: boolean } = {}) {
  const app = await NestFactory.create(modulo);
  if (opcoes.cors) app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // descarta campos que não estão no DTO
      forbidNonWhitelisted: true, // e rejeita a requisição se vierem campos extras
      transform: true,
      errorHttpStatusCode: 422,
    }),
  );
  app.useGlobalFilters(new FiltroDeExcecoes());
  app.enableShutdownHooks();
  await app.listen(porta);
  new Logger(nome).log(`"${nome}" no ar em http://localhost:${porta}`);
}
