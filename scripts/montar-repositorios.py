#!/usr/bin/env python3
"""Monta os 5 repositórios do PJBL a partir do monorepo, na pasta ./repositorios.
Uso (na raiz do projeto):  python3 scripts/montar-repositorios.py
Pode rodar quantas vezes quiser: a pasta repositorios/ é recriada do zero."""
import json, os, shutil, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BACK = RAIZ / 'backend'
FUNC = RAIZ / 'azure-function'
SAIDA = RAIZ / 'repositorios'
HUB = 'sofhiachromiec'
VERSAO = 'v1'
INTEGRANTES = ['Sofhia Chromiec', 'Fernanda Giacobbo', 'Júlia Melo', 'Pedro Serafim']
DISCIPLINA = 'Arquitetura de Soluções em Nuvem (PUCPR) - PJBL Miaudota - Entrega 3'
PROFESSOR = 'Prof. Manoel Valerio da Silveira Neto'
GH = 'https://github.com/SofhiaC'  # ajuste se os repositórios forem criados em outra conta/organização

# ---- o que vai em cada repositório ----------------------------------------------------------
REPOS = {
  'miaudota-bff': dict(
    titulo='Miaudota - BFF e API Gateway',
    resumo='Camada de borda do Miaudota: o **API Gateway** (JWT, limite de requisições, proxy) e o **BFF Mobile**, que agrega dados de vários microsserviços. Inclui o **worker de notificação** (RabbitMQ → n8n → e-mail).',
    src=['shared', 'bff-mobile', 'api-gateway', 'notificacao'],
    testes=['agregar-dados.test.ts', 'arquitetura.test.ts'],
    servicos=[('bff-mobile', 'bff', 3001, 'BFF Mobile (`GET /aggregated-data` + rotas proxy)'),
              ('api-gateway', 'gateway', 3000, 'API Gateway'),
              ('notificacao', 'notificacao', None, 'Worker de notificação (sem porta HTTP)')],
    scripts={'start:bff': 'bff-mobile', 'start:gateway': 'api-gateway', 'start:notificacao': 'notificacao'},
    endpoints=['`GET /aggregated-data` — junta animais (MongoDB), feiras (Azure SQL) e o indicador da Azure Function numa resposta só',
               '`/usuarios/*`, `/animais/*`, `/favoritos/*`, `/solicitacoes/*`, `/feiras/*` — encaminhados aos microsserviços',
               'Swagger do BFF em `/docs`'],
    arquitetura='O BFF e o gateway não importam código dos microsserviços: falam com eles só por HTTP (portas e adaptadores em `bff-mobile/aggregated-data`). O caso de uso `AgregarDados` depende de portas (`AnimaisFonte`, `FeirasFonte`, `IndicadorFonte`) e não sabe se a resposta vem de HTTP ou da Azure Function.',
    porta_padrao=3001, compose=False),
  'miaudota-ms-mongo': dict(
    titulo='Miaudota - Microsserviços MongoDB (Usuários e Adoção)',
    resumo='Os dois microsserviços que usam **MongoDB Atlas**: **Usuários** (cadastro, login com JWT, perfil, exclusão de conta) e **Adoção** (animais, favoritos e solicitações de adoção), ambos com CRUD completo e Swagger.',
    src=['shared', 'usuarios', 'adocao'],
    testes=['usuarios.test.ts', 'adocao.test.ts', 'arquitetura.test.ts', 'fakes-comum.ts', 'fakes-adocao.ts'],
    servicos=[('usuarios', 'usuarios', 3101, 'Microsserviço de Usuários'),
              ('adocao', 'adocao', 3102, 'Microsserviço de Adoção')],
    scripts={'start:usuarios': 'usuarios', 'start:adocao': 'adocao'},
    endpoints=['**Usuários** (`:3101`): `POST /usuarios`, `POST /usuarios/login`, `GET /usuarios/me`, `DELETE /usuarios/me`, `POST /internos/usuarios/resumos`',
               '**Adoção** (`:3102`): `POST|GET /animais`, `GET /animais/sugestoes`, `GET /animais/meus`, `GET|PATCH|DELETE /animais/:id`, `POST|GET /favoritos`, `DELETE /favoritos/:idAnimal`, `POST /solicitacoes`, `GET /solicitacoes/enviadas|recebidas`, `GET /solicitacoes/:id`, `PATCH /solicitacoes/:id/status`',
               'Swagger de cada serviço em `/docs`'],
    arquitetura='Cada serviço é dividido em `domain/` (entidades e portas), `casos-de-uso/<feature>/` (Vertical Slice: caso de uso + controller na mesma pasta), `infrastructure/` (adaptadores Mongoose, bcrypt, JWT) e `presentation/`. O domínio não importa framework nenhum.',
    porta_padrao=3101, compose=False),
  'miaudota-ms-sql': dict(
    titulo='Miaudota - Microsserviço de Geolocalização (Azure SQL)',
    resumo='Microsserviço de **feiras de adoção** com banco **Azure SQL Database**: CRUD completo de feiras, busca por proximidade (Haversine + caixa delimitadora) e vínculo com os animais da ONG. Swagger em `/docs`.',
    src=['shared', 'geolocalizacao'],
    testes=['geolocalizacao.test.ts', 'arquitetura.test.ts', 'fakes-comum.ts', 'fakes-geo.ts'],
    servicos=[('geolocalizacao', 'geolocalizacao', 3103, 'Microsserviço de Geolocalização')],
    scripts={'start:geolocalizacao': 'geolocalizacao'},
    endpoints=['`POST /feiras`, `GET /feiras`, `GET /feiras/proximas?lat=&lng=&raioKm=`, `GET|PATCH|DELETE /feiras/:id`, `PATCH /feiras/:id/animais`',
               'Só ONGs criam, alteram e excluem feiras (cabeçalho `x-usuario-tipo: ONG`)',
               'Swagger em `/docs`'],
    arquitetura='`domain/` (Feira, localização e a porta `FeiraRepository`), `casos-de-uso/<feature>/` (Vertical Slice), `infrastructure/` (adaptador `mssql` com consultas parametrizadas, transações e DDL idempotente). Referências a ONG e animais são lógicas (ids), sem chave estrangeira entre bancos.',
    porta_padrao=3103, compose=True),
}

# ---- utilitários ---------------------------------------------------------------------------
def copiar(origem: Path, destino: Path):
    destino.parent.mkdir(parents=True, exist_ok=True)
    if origem.is_dir():
        shutil.copytree(origem, destino, ignore=shutil.ignore_patterns('node_modules', 'dist', '*.tsbuildinfo'))
    else:
        shutil.copy2(origem, destino)

def escrever(caminho: Path, texto: str, exec_=False):
    caminho.parent.mkdir(parents=True, exist_ok=True)
    caminho.write_text(texto, encoding='utf-8')
    if exec_: caminho.chmod(0o755)

def grupo_md():
    linhas = '\n'.join(f'- {n}' for n in INTEGRANTES)
    return f'# Grupo\n\n{DISCIPLINA}\n\n{PROFESSOR}\n\n## Integrantes\n\n{linhas}\n'

def imagem(nome): return f'{HUB}/pjbl-{nome}:{VERSAO}'

def tabela_imagens(servicos):
    l = ['| Serviço | Imagem no Docker Hub |', '|---|---|']
    for _, img, _, desc in servicos: l.append(f'| {desc} | `{imagem(img)}` |')
    return '\n'.join(l)

# ---- repositórios de backend ---------------------------------------------------------------
def montar_backend(nome, cfg):
    d = SAIDA / nome
    for s in cfg['src']: copiar(BACK / 'src' / s, d / 'src' / s)
    for t in cfg['testes']: copiar(BACK / 'src' / 'testes' / t, d / 'src' / 'testes' / t)
    for f in ['tsconfig.json', 'nest-cli.json', '.env.example']: copiar(BACK / f, d / f)

    pkg = json.loads((BACK / 'package.json').read_text())
    pkg['name'] = nome; pkg['version'] = '1.0.0'
    sv = cfg['scripts']
    scripts = {'build': 'tsc -p tsconfig.json', 'build:watch': 'tsc -p tsconfig.json --watch --preserveWatchOutput'}
    for k, v in sv.items(): scripts[k] = f'node dist/{v}/main.js'
    nomes = ','.join(v.split('-')[0] for v in sv.values())
    cmds = ' '.join(f'\\"node --watch dist/{v}/main.js\\"' for v in sv.values())
    scripts['dev'] = f'concurrently -k -n {nomes} {cmds}'
    scripts['start:all'] = 'npm run build && npm run dev'
    scripts['test'] = 'tsc -p tsconfig.json && node --test "dist/testes/*.test.js"'
    pkg['scripts'] = scripts
    escrever(d / 'package.json', json.dumps(pkg, indent=2, ensure_ascii=False) + '\n')
    lock = json.loads((BACK / 'package-lock.json').read_text())
    lock['name'] = nome
    if '' in lock.get('packages', {}): lock['packages']['']['name'] = nome; lock['packages']['']['version'] = '1.0.0'
    escrever(d / 'package-lock.json', json.dumps(lock, indent=2, ensure_ascii=False) + '\n')

    padrao = cfg['servicos'][0][0]
    escrever(d / 'Dockerfile', f'''# Imagem do backend NestJS. O serviço que roda é escolhido no build:
#   docker build --platform linux/amd64 --build-arg SERVICO={padrao} -t {imagem(cfg['servicos'][0][1])} .
# SERVICO aceito neste repositório: {' | '.join(s[0] for s in cfg['servicos'])}

# ---- etapa 1: compila o TypeScript ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- etapa 2: imagem final, só com o necessário para rodar ----
FROM node:20-alpine
ARG SERVICO={padrao}
ENV NODE_ENV=production SERVICO=${{SERVICO}}
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE {' '.join(str(s[2]) for s in cfg['servicos'] if s[2])}
CMD ["sh", "-c", "node dist/${{SERVICO}}/main.js"]
''')
    escrever(d / '.dockerignore', 'node_modules\ndist\n.env\n*.log\ntsconfig.tsbuildinfo\n.git\n')
    escrever(d / '.gitignore', 'node_modules\ndist\n.env\n*.log\ntsconfig.tsbuildinfo\n.DS_Store\n')

    pub = ['#!/usr/bin/env bash', '# Constrói e publica as imagens deste repositório no Docker Hub.', '# Antes: docker login   (use a conta ' + HUB + ')', 'set -euo pipefail', 'cd "$(dirname "$0")"']
    for sv_, img, _, _ in cfg['servicos']:
        pub.append(f'docker build --platform linux/amd64 --build-arg SERVICO={sv_} -t {imagem(img)} .')
        pub.append(f'docker push {imagem(img)}')
    pub.append('echo "Imagens publicadas."')
    escrever(d / 'publicar.sh', '\n'.join(pub) + '\n', exec_=True)

    if cfg['compose']:
        escrever(d / 'docker-compose.yml', '''# SQL Server local, só para desenvolvimento. Na nuvem o banco é o Azure SQL Database.
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=Miaudota#Dev2026
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
volumes:
  sqlserver_data:
''')

    runs = []
    for sv_, img, porta, desc in cfg['servicos']:
        if porta: runs.append(f'docker run --rm -p {porta}:{porta} --env-file .env {imagem(img)}   # {desc}')
        else: runs.append(f'docker run --rm --env-file .env {imagem(img)}   # {desc}')
    runs = '\n'.join(runs)
    eps = '\n'.join(f'- {e}' for e in cfg['endpoints'])
    avisos = ''
    if nome == 'miaudota-ms-sql':
        avisos = '\nPara usar o SQL Server local em vez do Azure: `docker compose up -d` e deixe `SQL_SERVER=localhost`, `SQL_CRIAR_BANCO=true` no `.env`.\n'
    escrever(d / 'README.md', f'''# {cfg['titulo']}

{cfg['resumo']}

> {DISCIPLINA}. Integrantes em [GRUPO.md](GRUPO.md).

## Arquitetura

Clean Architecture (Domain / Application / Infrastructure / Presentation) combinada com **Vertical Slice**: cada funcionalidade fica em `src/<serviço>/casos-de-uso/<feature>/`, com o caso de uso e o controller lado a lado.

{cfg['arquitetura']}

As regras de dependência são verificadas automaticamente pelos **testes de arquitetura** (`src/testes/arquitetura.test.ts`): o domínio não importa frameworks, os casos de uso não dependem de infraestrutura, uma fatia não importa outra, e um serviço não importa outro.

```
src/
  shared/            erros de domínio, eventos, autenticação interna, configuração
{chr(10).join(f'  {s}/' for s in cfg['src'] if s != 'shared')}
  testes/            testes unitários e de arquitetura
```

## Tecnologias

Node.js 20, TypeScript, NestJS 10, Swagger (`@nestjs/swagger`), class-validator, RabbitMQ (eventos), Docker, testes com `node:test`.
{'MongoDB Atlas (Mongoose), bcrypt, JWT.' if nome == 'miaudota-ms-mongo' else ''}{'Azure SQL Database (`mssql`).' if nome == 'miaudota-ms-sql' else ''}

## Endpoints principais

{eps}

## Como executar

### 1. Pelas imagens do Docker Hub (recomendado)

{tabela_imagens(cfg['servicos'])}

Crie um `.env` a partir de `.env.example` (chaves, banco e RabbitMQ) e rode:

```bash
{runs}
```

URLs na nuvem: *(preencher após o deploy)*

| Serviço | URL pública | Swagger |
|---|---|---|
| {cfg['servicos'][0][3]} | _a preencher_ | _a preencher_/docs |

### 2. Localmente com Node

```bash
cp .env.example .env     # preencha os valores
npm install
npm run start:all        # compila e sobe os serviços deste repositório
```
{avisos}
O Swagger de cada serviço fica em `http://localhost:<porta>/docs` (use o botão **Authorize** para informar `chave-interna` e, quando pedido, `usuario-id` e `usuario-tipo`).

## Testes

```bash
npm test
```

Executa os testes unitários (regras de negócio e casos de uso, com dublês em memória) e os testes de arquitetura.

## Publicar as imagens

```bash
docker login
./publicar.sh
```

## Integrantes

{chr(10).join('- ' + n for n in INTEGRANTES)}
''')
    escrever(d / 'GRUPO.md', grupo_md())

# ---- repositório da Function --------------------------------------------------------------
def montar_function():
    nome = 'miaudota-function'
    d = SAIDA / nome
    for item in FUNC.iterdir():
        if item.name in ('node_modules', 'dist', 'local.settings.json'): continue
        copiar(item, d / item.name)
    escrever(d / '.dockerignore', 'node_modules\ndist\nlocal.settings.json\ntest\n.git\n')
    escrever(d / 'GRUPO.md', grupo_md())
    escrever(d / 'publicar.sh', f'''#!/usr/bin/env bash
# Constrói e publica a imagem da Function no Docker Hub (login antes: docker login).
set -euo pipefail
cd "$(dirname "$0")"
docker build --platform linux/amd64 -t {imagem('function')} .
docker push {imagem('function')}
echo "Imagem publicada."
''', exec_=True)
    escrever(d / 'README.md', f'''# Miaudota - Azure Function (Indicador de Adoção)

Azure Function (**HTTP Trigger**, Node.js 20, modelo v4, TypeScript) chamada pelo BFF em `GET /aggregated-data`. Recebe a quantidade de animais disponíveis e de feiras ativas e devolve um **indicador de oportunidade de adoção** (pontuação, nível BAIXA/MEDIA/ALTA e mensagem).

> {DISCIPLINA}. Integrantes em [GRUPO.md](GRUPO.md).

## Arquitetura

A regra de negócio fica em `src/dominio/indicador.ts` (função pura, sem dependência do Azure); `src/functions/indicadorAdocao.ts` é só o adaptador HTTP. Isso permite testar a regra sem subir a Function.

Pontuação: `min(feiras, 5) * 12 + min(animais, 40)`. Nível: **ALTA** a partir de 70, **MEDIA** a partir de 35, senão **BAIXA**.

## Endpoint

`GET|POST /api/indicador-adocao?animaisDisponiveis=<n>&feirasAtivas=<n>` — `authLevel: function` (chave no cabeçalho `x-functions-key`).

## Tecnologias

Azure Functions v4, Node.js 20, TypeScript, Docker.

## Como executar

### Localmente

```bash
cp local.settings.example.json local.settings.json
npm install
npm start              # precisa do Azure Functions Core Tools (func); sobe em http://localhost:7071
```

### Imagem do Docker Hub

| Serviço | Imagem |
|---|---|
| Azure Function | `{imagem('function')}` |

```bash
docker run --rm -p 7071:80 {imagem('function')}
```

URL na nuvem: *(preencher após o deploy)* — `https://<app>.azurewebsites.net/api/indicador-adocao`

## Testes

```bash
npm test
```

## Integrantes

{chr(10).join('- ' + n for n in INTEGRANTES)}
''')

# ---- repositório do frontend ---------------------------------------------------------------
def montar_frontend():
    d = SAIDA / 'miaudota-frontend'
    origem = RAIZ / 'frontend'
    # o README completo, o Dockerfile e o código vivem em ./frontend (node_modules/dist ficam de fora)
    shutil.copytree(origem, d, ignore=shutil.ignore_patterns('node_modules', 'dist'))
    escrever(d / 'GRUPO.md', grupo_md())
    (d / 'publicar.sh').chmod(0o755)

# ---- orquestração --------------------------------------------------------------------------
def main():
    if SAIDA.exists(): shutil.rmtree(SAIDA)
    SAIDA.mkdir()
    for nome, cfg in REPOS.items():
        montar_backend(nome, cfg); print('ok', nome)
    montar_function(); print('ok miaudota-function')
    montar_frontend(); print('ok miaudota-frontend')
    escrever(SAIDA / 'publicar-todas.sh', '''#!/usr/bin/env bash
# Publica as imagens de todos os repositórios (login antes: docker login).
set -euo pipefail
cd "$(dirname "$0")"
for r in miaudota-bff miaudota-ms-mongo miaudota-ms-sql miaudota-function miaudota-frontend; do
  echo "== $r"; "./$r/publicar.sh"
done
''', exec_=True)

if __name__ == '__main__': main()
