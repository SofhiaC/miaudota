# Miaudota

App React Native (Expo) + backend em **seis processos NestJS**: API Gateway, BFF Mobile, três serviços
(usuários, adoção, geolocalização) e a função de notificação. Cada serviço tem o seu banco (usuários e adoção em MongoDB, geolocalização em Azure SQL); falam por REST interno e por eventos no RabbitMQ.
Os e-mails saem pelo **n8n** (webhook), que entrega ao SMTP — em desenvolvimento, o **Mailpit**.

```
app mobile ──> API Gateway :3000 ──> BFF Mobile :3001 ──┬─> usuarios       :3101 ─> miaudota_usuarios
 (JWT)         JWT, rate limit,      agrega respostas   ├─> adocao         :3102 ─> miaudota_adocao
               correlation id        (animais nas feiras)└─> geolocalizacao :3103 ─> miaudota_geolocalizacao
                                                              │ publicam eventos
                                                              ▼
                                                      RabbitMQ (miaudota.eventos)
                                                              │ UsuarioCadastrado · SolicitacaoAdocaoCriada · FeiraCadastrada
                                                              ▼
                                       notificacao ──webhook──> n8n :5678 ──SMTP──> Mailpit :8025 (dev) / provedor real
```

## Rodando

1. Infra (Mongo, SQL Server, RabbitMQ, n8n, Mailpit):  `docker compose up -d`
2. **Uma vez só**, configure o n8n (veja "Configurando o n8n" abaixo).
3. Backend:
   ```
   cd backend
   cp .env.example .env     # se ainda não tem; defina JWT_SECRET e INTERNAL_API_KEY
   npm install
   npm run start:all        # compila e sobe os 6 processos, com logs coloridos por serviço
   ```
   Para recarregar ao editar: deixe `npm run build:watch` rodando em outro terminal.
4. App:  `cd mobile && npm install && npx expo install --fix && npx expo start`
   (o `API_URL` em `mobile/api.js` continua apontando para a porta **3000**, a do gateway).

Painéis: RabbitMQ http://localhost:15672 (guest/guest) · n8n http://localhost:5678 · caixa de e-mails de teste http://localhost:8025

## Configurando o n8n (uma vez)

1. Abra http://localhost:5678 e crie a conta de administrador local (primeira vez).
2. **Workflows → Import from file** e escolha `n8n/workflow-miaudota-email.json`.
3. Abra o nó **Enviar e-mail** → em *Credential* escolha **Create new → SMTP** com: Host `mailpit`, Port `1025`, User e Password vazios, SSL/TLS desligado. Salve.
4. Ative o workflow (chave **Active**, ou **Publish** nas versões mais novas do n8n).
5. Teste sem o resto do sistema:
   ```
   curl -X POST http://localhost:5678/webhook/miaudota-email -H "Content-Type: application/json" \
     -d '{"destinatario":"teste@exemplo.com","assunto":"Teste","texto":"Olá","html":"<p>Olá</p>"}'
   ```
   O e-mail deve aparecer em http://localhost:8025.

Se a importação falhar, crie o workflow à mão: nó **Webhook** (POST, path `miaudota-email`, Respond = *When Last Node Finishes*) ligado a um nó **Send Email**
com To `{{ $json.body.destinatario }}`, Subject `{{ $json.body.assunto }}`, Email Format *Both*, Text `{{ $json.body.texto }}`, HTML `{{ $json.body.html }}`.

**E-mail de verdade:** troque a credencial SMTP no n8n pelas do seu provedor (ex.: Gmail `smtp.gmail.com`, porta 465, SSL, com *senha de app*) e o remetente no nó. Nada muda no código.
Atenção: com SMTP real, as contas de teste com e-mails inventados também vão receber mensagens — use endereços seus nos testes.

## Notificações

| Evento | Quem recebe | Conteúdo |
|---|---|---|
| `UsuarioCadastrado` | o novo usuário | boas-vindas (texto muda para PESSOA e ONG) |
| `SolicitacaoAdocaoCriada` | o dono do animal | "fulano quer adotar X" |
| `FeiraCadastrada` | a ONG que cadastrou | confirmação com local e período |

Os eventos já carregam destinatário e dados (a função não consulta nenhum serviço). Os textos padrão estão em `backend/src/notificacao/domain/mensagens.ts`;
o n8n pode trocar o texto, adicionar canais ou mudar o provedor sem tocar no código dos serviços.

**Falhas:** se o n8n estiver fora do ar ou o workflow não estiver ativo, a função tenta 3 vezes e a mensagem vai para a fila de descarte
`notificacao.<Evento>.dlq` (visível no painel do RabbitMQ). A ação do usuário nunca é desfeita. Depois de resolver, `npm run notificacao:reenviar` devolve as mensagens para a fila.

## App mobile (visual)

Layout do Figma aplicado em `mobile/`: amarelo `#FFE880`, barra do topo `#4E4623`, botões `#241A13`, fonte **Madimi One** (logo, títulos, rótulos e botões; `@expo-google-fonts/madimi-one`).

| Aba (barra inferior) | Tela |
|---|---|
| ❤ | Favoritos: Remover / Solicitar Adoção |
| 🕒 | Pedidos: Enviados por Mim / Recebidos |
| ⊕ (centro) | Descobrir: pilha de cartões estilo "tinder". Arraste para a direita (ou ❤) para curtir, para a esquerda (ou ✕) para pular, ou toque no avião de papel para solicitar a adoção |
| 📍 | Feiras: Lista / Mapa |
| 👤 | Meus animais: Cadastrar Animal |
| 👤 (topo) | Perfil: Sair / Excluir Minha Conta |

ONG não adota: vê só Pedidos (recebidos), Feiras e Meus animais, e é a única que vê "Cadastrar Feira".
Tudo em `mobile/tema.js` (cores e fontes) e `mobile/componentes/` (peças reutilizáveis); as ilustrações estão em `mobile/assets/imagens/`.

## Responsabilidades

| Processo | Porta | Faz |
|---|---|---|
| API Gateway | 3000 | valida o JWT, rate limit por IP, gera o `x-correlation-id`, descarta cabeçalhos internos do cliente, encaminha ao BFF |
| BFF Mobile | 3001 | roteia para o serviço dono do assunto; troca os ids dos animais das feiras pelos dados completos |
| usuarios | 3101 | cadastro, login (emite o JWT), perfil, exclusão de conta |
| adocao | 3102 | animais, favoritos, sugestões, solicitações de adoção |
| geolocalizacao | 3103 | feiras (CRUD), busca por proximidade, animais levados à feira (só ids). Banco Azure SQL. Swagger em `/docs` |
| notificacao | — | consome eventos e aciona o n8n; sem HTTP e sem banco |

Segurança entre componentes: o JWT só é validado no gateway. Gateway, BFF e serviços se falam com a `INTERNAL_API_KEY`;
os serviços recusam (401) qualquer chamada sem ela e recebem o usuário pelos cabeçalhos `x-usuario-id` / `x-usuario-tipo`.
Rotas `/internos/*` existem só entre serviços e nunca passam pelo gateway.

## Eventos (RabbitMQ)

Troca `miaudota.eventos` (tópico). Cada serviço tem uma fila durável por evento que assina; mensagem que falha vai para `<servico>.<Evento>.dlq`.
Se o RabbitMQ cair, os eventos ficam em memória e saem quando ele voltar.

| Evento | Publicado por | Consumido por |
|---|---|---|
| `UsuarioCadastrado` | usuarios | notificacao |
| `SolicitacaoAdocaoCriada` | adocao | notificacao |
| `FeiraCadastrada` | geolocalizacao | notificacao |
| `UsuarioExcluido` | usuarios | adocao e geolocalizacao (apagam os dados do usuário) |

## Dentro de cada serviço (`backend/src/<servico>/`)

```
domain/           entidades e regras + portas dos repositórios
application/      portas para outros serviços (gateways) e serviços de apoio
infrastructure/   MongoDB / Azure SQL, gateways HTTP, bcrypt, JWT, webhook do n8n
presentation/     presenters (entidade -> JSON)
casos-de-uso/     uma pasta por caso de uso: <nome>.use-case.ts + <nome>.controller.ts (ou .handler.ts para eventos)
```
`backend/src/shared/` tem o que os processos usam: erros de domínio, filtro de erros, guard interno, cliente HTTP, correlation id, RabbitMQ e os contratos dos eventos.

## Tipos de usuário

| Capacidade | PESSOA | ONG |
|---|---|---|
| Ver animais para adoção, curtir, favoritar e solicitar adoção (menos de animal próprio) | ✅ | ❌ |
| Cadastrar animais e responder solicitações dos próprios animais | ✅ | ✅ |
| Ver mapa e lista de feiras | ✅ | ✅ |
| Criar feira e levar seus animais disponíveis para ela | ❌ | ✅ |

## Endpoints (todos pelo gateway, `Authorization: Bearer <JWT>`, exceto os dois primeiros)

| Método | Rota | Quem |
|---|---|---|
| POST | /usuarios `{nome,email,senha,tipo: PESSOA\|ONG,consentimentoLgpd}` | público |
| POST | /usuarios/login `{email,senha}` | público |
| GET | /usuarios/me | logado |
| DELETE | /usuarios/me | logado |
| GET | /animais · /animais/sugestoes | PESSOA |
| GET | /animais/meus · /animais/:id | logado |
| POST | /animais `{nome,especie,idade,descricao?}` | logado |
| POST · GET · DELETE | /favoritos · /favoritos/:idAnimal | PESSOA |
| POST | /solicitacoes `{id_animal}` | PESSOA (não vale para animal próprio) |
| GET | /solicitacoes/enviadas · /solicitacoes/recebidas · /solicitacoes/:id | logado (:id só quem enviou ou o dono) |
| PATCH | /solicitacoes/:id/status `{status: APROVADA\|RECUSADA}` | dono do animal |
| POST | /feiras `{nome,descricao?,endereco,latitude,longitude,dataInicio,dataFim,animais?: [id]}` | ONG |
| PATCH | /feiras/:id/animais `{animais: [id]}` | ONG dona da feira |
| GET | /feiras · /feiras/proximas?lat=&lng=&raioKm= | logado |
