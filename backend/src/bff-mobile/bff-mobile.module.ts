import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthInternoModule } from '../shared/auth/interno.guard';
import { correlacao } from '../shared/http/correlacao.middleware';
import { BffController } from './bff.controller';

@Module({
  imports: [AuthInternoModule],
  controllers: [BffController],
})
export class BffMobileModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlacao('bff-mobile')).forRoutes('*');
  }
}
