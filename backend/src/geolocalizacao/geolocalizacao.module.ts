import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnimaisGateway } from './application/animais.gateway';
import { MontarVisaoDasFeiras } from './application/montar-visao-das-feiras';
import { FeiraRepository } from './domain/feira.repository';
import { AnimaisGatewayHttp } from './infrastructure/animais.gateway-http';
import { UsuarioGateway } from './application/usuario.gateway';
import { UsuarioGatewayHttp } from './infrastructure/usuario.gateway-http';
import { FeiraDocumento, FeiraSchema } from './infrastructure/feira.schema';
import { FeiraMongoRepository } from './infrastructure/feira.mongo-repository';
import { CadastrarFeira } from './casos-de-uso/cadastrar-feira/cadastrar-feira.use-case';
import { CadastrarFeiraController } from './casos-de-uso/cadastrar-feira/cadastrar-feira.controller';
import { DefinirAnimaisDaFeira } from './casos-de-uso/definir-animais-da-feira/definir-animais-da-feira.use-case';
import { DefinirAnimaisDaFeiraController } from './casos-de-uso/definir-animais-da-feira/definir-animais-da-feira.controller';
import { ListarFeiras } from './casos-de-uso/listar-feiras/listar-feiras.use-case';
import { ListarFeirasController } from './casos-de-uso/listar-feiras/listar-feiras.controller';
import { ListarFeirasProximas } from './casos-de-uso/listar-feiras-proximas/listar-feiras-proximas.use-case';
import { ListarFeirasProximasController } from './casos-de-uso/listar-feiras-proximas/listar-feiras-proximas.controller';
import { RemoverFeirasDaOng } from './casos-de-uso/remover-feiras-da-ong/remover-feiras-da-ong.use-case';
import { RemoverFeirasDaOngHandler } from './casos-de-uso/remover-feiras-da-ong/remover-feiras-da-ong.handler';

@Module({
  imports: [MongooseModule.forFeature([{ name: FeiraDocumento.name, schema: FeiraSchema }], 'geolocalizacao')],
  controllers: [
    CadastrarFeiraController,
    ListarFeirasController,
    ListarFeirasProximasController,
    DefinirAnimaisDaFeiraController,
  ],
  providers: [
    CadastrarFeira, DefinirAnimaisDaFeira, ListarFeiras, ListarFeirasProximas,
    RemoverFeirasDaOng, RemoverFeirasDaOngHandler, MontarVisaoDasFeiras,
    { provide: FeiraRepository, useClass: FeiraMongoRepository },
    { provide: AnimaisGateway, useClass: AnimaisGatewayHttp },
    { provide: UsuarioGateway, useClass: UsuarioGatewayHttp },
  ],
})
export class GeolocalizacaoModule {}
