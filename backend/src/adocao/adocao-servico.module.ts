import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthInternoModule } from '../shared/auth/interno.guard';
import { uriMongo } from '../shared/config';
import { EventsModule } from '../shared/events/events.module';
import { correlacao } from '../shared/http/correlacao.middleware';
import { AdocaoModule } from './adocao.module';

/** Raiz do serviço de adoção: banco miaudota_adocao e eventos. */
@Module({
  imports: [
    MongooseModule.forRoot(uriMongo('ADOCAO'), { connectionName: 'adocao' }),
    AuthInternoModule,
    EventsModule.registrar('adocao'),
    AdocaoModule,
  ],
})
export class AdocaoServicoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlacao('adocao')).forRoutes('*');
  }
}
