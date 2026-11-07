import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DetalharSolicitacoes } from './application/detalhar-solicitacoes';
import { UsuarioGateway } from './application/usuario.gateway';
import { AnimalRepository, FavoritoRepository, SolicitacaoRepository } from './domain/repositorios';
import { AnimalMongoRepository } from './infrastructure/animal.mongo-repository';
import { FavoritoMongoRepository } from './infrastructure/favorito.mongo-repository';
import { SolicitacaoMongoRepository } from './infrastructure/solicitacao.mongo-repository';
import { UsuarioGatewayHttp } from './infrastructure/usuario.gateway-http';
import {
  AnimalDocumento, AnimalSchema, FavoritoDocumento, FavoritoSchema,
  SolicitacaoDocumento, SolicitacaoSchema,
} from './infrastructure/schemas';

import { CadastrarAnimal } from './casos-de-uso/cadastrar-animal/cadastrar-animal.use-case';
import { CadastrarAnimalController } from './casos-de-uso/cadastrar-animal/cadastrar-animal.controller';
import { ListarAnimais } from './casos-de-uso/listar-animais/listar-animais.use-case';
import { ListarAnimaisController } from './casos-de-uso/listar-animais/listar-animais.controller';
import { SugerirAnimais } from './casos-de-uso/sugerir-animais/sugerir-animais.use-case';
import { SugerirAnimaisController } from './casos-de-uso/sugerir-animais/sugerir-animais.controller';
import { ListarMeusAnimais } from './casos-de-uso/listar-meus-animais/listar-meus-animais.use-case';
import { ListarMeusAnimaisController } from './casos-de-uso/listar-meus-animais/listar-meus-animais.controller';
import { BuscarAnimal } from './casos-de-uso/buscar-animal/buscar-animal.use-case';
import { BuscarAnimalController } from './casos-de-uso/buscar-animal/buscar-animal.controller';
import { AtualizarAnimal } from './casos-de-uso/atualizar-animal/atualizar-animal.use-case';
import { AtualizarAnimalController } from './casos-de-uso/atualizar-animal/atualizar-animal.controller';
import { ExcluirAnimal } from './casos-de-uso/excluir-animal/excluir-animal.use-case';
import { ExcluirAnimalController } from './casos-de-uso/excluir-animal/excluir-animal.controller';
import { FavoritarAnimal } from './casos-de-uso/favoritar-animal/favoritar-animal.use-case';
import { FavoritarAnimalController } from './casos-de-uso/favoritar-animal/favoritar-animal.controller';
import { ListarFavoritos } from './casos-de-uso/listar-favoritos/listar-favoritos.use-case';
import { ListarFavoritosController } from './casos-de-uso/listar-favoritos/listar-favoritos.controller';
import { RemoverFavorito } from './casos-de-uso/remover-favorito/remover-favorito.use-case';
import { RemoverFavoritoController } from './casos-de-uso/remover-favorito/remover-favorito.controller';
import { SolicitarAdocao } from './casos-de-uso/solicitar-adocao/solicitar-adocao.use-case';
import { SolicitarAdocaoController } from './casos-de-uso/solicitar-adocao/solicitar-adocao.controller';
import { ListarSolicitacoesEnviadas } from './casos-de-uso/listar-solicitacoes-enviadas/listar-solicitacoes-enviadas.use-case';
import { ListarSolicitacoesEnviadasController } from './casos-de-uso/listar-solicitacoes-enviadas/listar-solicitacoes-enviadas.controller';
import { ListarSolicitacoesRecebidas } from './casos-de-uso/listar-solicitacoes-recebidas/listar-solicitacoes-recebidas.use-case';
import { ListarSolicitacoesRecebidasController } from './casos-de-uso/listar-solicitacoes-recebidas/listar-solicitacoes-recebidas.controller';
import { BuscarSolicitacao } from './casos-de-uso/buscar-solicitacao/buscar-solicitacao.use-case';
import { BuscarSolicitacaoController } from './casos-de-uso/buscar-solicitacao/buscar-solicitacao.controller';
import { ResponderSolicitacao } from './casos-de-uso/responder-solicitacao/responder-solicitacao.use-case';
import { ResponderSolicitacaoController } from './casos-de-uso/responder-solicitacao/responder-solicitacao.controller';
import { ConsultarAnimais } from './casos-de-uso/consultar-animais/consultar-animais.use-case';
import { ConsultarAnimaisController } from './casos-de-uso/consultar-animais/consultar-animais.controller';
import { RemoverDadosDoUsuario } from './casos-de-uso/remover-dados-do-usuario/remover-dados-do-usuario.use-case';
import { RemoverDadosDoUsuarioHandler } from './casos-de-uso/remover-dados-do-usuario/remover-dados-do-usuario.handler';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: AnimalDocumento.name, schema: AnimalSchema },
        { name: FavoritoDocumento.name, schema: FavoritoSchema },
        { name: SolicitacaoDocumento.name, schema: SolicitacaoSchema },
      ],
      'adocao',
    ),
  ],
  // ATENÇÃO À ORDEM: rotas fixas (meus, sugestoes, enviadas, recebidas) vêm antes das rotas com :id
  controllers: [
    CadastrarAnimalController,
    ListarAnimaisController,
    SugerirAnimaisController,
    ListarMeusAnimaisController,
    BuscarAnimalController,
    AtualizarAnimalController,
    ExcluirAnimalController,
    FavoritarAnimalController,
    ListarFavoritosController,
    RemoverFavoritoController,
    SolicitarAdocaoController,
    ListarSolicitacoesEnviadasController,
    ListarSolicitacoesRecebidasController,
    BuscarSolicitacaoController,
    ResponderSolicitacaoController,
    ConsultarAnimaisController,
  ],
  providers: [
    CadastrarAnimal, ListarAnimais, SugerirAnimais, ListarMeusAnimais, BuscarAnimal, AtualizarAnimal, ExcluirAnimal,
    FavoritarAnimal, ListarFavoritos, RemoverFavorito,
    SolicitarAdocao, ListarSolicitacoesEnviadas, ListarSolicitacoesRecebidas, BuscarSolicitacao, ResponderSolicitacao,
    ConsultarAnimais, DetalharSolicitacoes, RemoverDadosDoUsuario, RemoverDadosDoUsuarioHandler,
    { provide: AnimalRepository, useClass: AnimalMongoRepository },
    { provide: FavoritoRepository, useClass: FavoritoMongoRepository },
    { provide: SolicitacaoRepository, useClass: SolicitacaoMongoRepository },
    { provide: UsuarioGateway, useClass: UsuarioGatewayHttp },
  ],
})
export class AdocaoModule {}
