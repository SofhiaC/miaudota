import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthInternoModule } from '../shared/auth/interno.guard';
import { EventsModule } from '../shared/events/events.module';
import { correlacao } from '../shared/http/correlacao.middleware';
import { GeolocalizacaoModule } from './geolocalizacao.module';

/** Raiz do serviço de geolocalização: banco Azure SQL (ConexaoSql, no módulo) e eventos. */
@Module({
  imports: [AuthInternoModule, EventsModule.registrar('geolocalizacao'), GeolocalizacaoModule],
})
export class GeolocalizacaoServicoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlacao('geolocalizacao')).forRoutes('*');
  }
}
