import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthInternoModule } from '../shared/auth/interno.guard';
import { segredoJwt, uriMongo } from '../shared/config';
import { EventsModule } from '../shared/events/events.module';
import { correlacao } from '../shared/http/correlacao.middleware';
import { UsuariosModule } from './usuarios.module';

/** Raiz do serviço de usuários: banco miaudota_usuarios, emissão de JWT e eventos. */
@Module({
  imports: [
    MongooseModule.forRoot(uriMongo('USUARIOS'), { connectionName: 'usuarios' }),
    JwtModule.register({ global: true, secret: segredoJwt(), signOptions: { expiresIn: '7d' } }),
    AuthInternoModule,
    EventsModule.registrar('usuarios'),
    UsuariosModule,
  ],
})
export class UsuariosServicoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(correlacao('usuarios')).forRoutes('*');
  }
}
