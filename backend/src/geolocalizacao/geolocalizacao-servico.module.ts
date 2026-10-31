import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthInternoModule } from '../shared/auth/interno.guard';
import { uriMongo } from '../shared/config';
import { EventsModule } from '../shared/events/events.module';
import { correlacao } from '../shared/http/correlacao.middleware';
import { GeolocalizacaoModule } from './geolocalizacao.module';

/** Raiz do serviço de geolocalização: banco miaudota_geolocalizacao e eventos. */
@Module({
  imports: [
    MongooseModule.forRoot(uriMongo('GEOLOCALIZACAO'), { connectionName: 'geolocalizacao' }),
    AuthInternoModule,
    EventsModule.registrar('geolocalizacao'),
    GeolocalizacaoModule,
  ],
})
export class GeolocalizacaoServicoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlacao('geolocalizacao')).forRoutes('*');
  }
}
