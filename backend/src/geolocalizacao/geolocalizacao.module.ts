import { Module } from '@nestjs/common';
import { AnimaisGateway } from './application/animais.gateway';
import { MontarVisaoDasFeiras } from './application/montar-visao-das-feiras';
import { FeiraRepository } from './domain/feira.repository';
import { AnimaisGatewayHttp } from './infrastructure/animais.gateway-http';
import { UsuarioGateway } from './application/usuario.gateway';
import { UsuarioGatewayHttp } from './infrastructure/usuario.gateway-http';
import { ConexaoSql } from './infrastructure/conexao-sql';
import { FeiraSqlRepository } from './infrastructure/feira.sql-repository';
import { CadastrarFeira } from './casos-de-uso/cadastrar-feira/cadastrar-feira.use-case';
import { CadastrarFeiraController } from './casos-de-uso/cadastrar-feira/cadastrar-feira.controller';
import { DefinirAnimaisDaFeira } from './casos-de-uso/definir-animais-da-feira/definir-animais-da-feira.use-case';
import { DefinirAnimaisDaFeiraController } from './casos-de-uso/definir-animais-da-feira/definir-animais-da-feira.controller';
import { ListarFeiras } from './casos-de-uso/listar-feiras/listar-feiras.use-case';
import { ListarFeirasController } from './casos-de-uso/listar-feiras/listar-feiras.controller';
import { ListarFeirasProximas } from './casos-de-uso/listar-feiras-proximas/listar-feiras-proximas.use-case';
import { ListarFeirasProximasController } from './casos-de-uso/listar-feiras-proximas/listar-feiras-proximas.controller';
import { ObterFeira } from './casos-de-uso/obter-feira/obter-feira.use-case';
import { ObterFeiraController } from './casos-de-uso/obter-feira/obter-feira.controller';
import { AtualizarFeira } from './casos-de-uso/atualizar-feira/atualizar-feira.use-case';
import { AtualizarFeiraController } from './casos-de-uso/atualizar-feira/atualizar-feira.controller';
import { ExcluirFeira } from './casos-de-uso/excluir-feira/excluir-feira.use-case';
import { ExcluirFeiraController } from './casos-de-uso/excluir-feira/excluir-feira.controller';
import { RemoverFeirasDaOng } from './casos-de-uso/remover-feiras-da-ong/remover-feiras-da-ong.use-case';
import { RemoverFeirasDaOngHandler } from './casos-de-uso/remover-feiras-da-ong/remover-feiras-da-ong.handler';

@Module({
  controllers: [
    CadastrarFeiraController,
    ListarFeirasController,
    ListarFeirasProximasController, // antes de ObterFeira: "/feiras/proximas" não pode cair em "/feiras/:id"
    ObterFeiraController,
    AtualizarFeiraController,
    DefinirAnimaisDaFeiraController,
    ExcluirFeiraController,
  ],
  providers: [
    CadastrarFeira, ListarFeiras, ListarFeirasProximas, ObterFeira, AtualizarFeira,
    DefinirAnimaisDaFeira, ExcluirFeira, RemoverFeirasDaOng, RemoverFeirasDaOngHandler, MontarVisaoDasFeiras,
    ConexaoSql,
    { provide: FeiraRepository, useClass: FeiraSqlRepository },
    { provide: AnimaisGateway, useClass: AnimaisGatewayHttp },
    { provide: UsuarioGateway, useClass: UsuarioGatewayHttp },
  ],
})
export class GeolocalizacaoModule {}
