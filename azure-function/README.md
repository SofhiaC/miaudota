# Miaudota – Azure Function (indicador de oportunidade de adoção)

Integrantes: Fernanda Giacobbo, Júlia Melo, Pedro Serafim e Sofhia Chromiec.

## O que é
Função **HTTP Trigger** (Azure Functions v4, Node.js/TypeScript) chamada pelo **BFF** no `GET /aggregated-data`.
Recebe duas contagens e devolve um índice de oportunidade de adoção (enriquecimento dos dados agregados).

`GET /api/indicador-adocao?animais=12&feiras=3`

```json
{ "animaisDisponiveis": 12, "feirasAtivas": 3, "animaisPorFeira": 4, "pontuacao": 48,
  "nivel": "MEDIA", "mensagem": "Há opções de animais e feiras; vale acompanhar as próximas feiras.", "geradoEm": "..." }
```
Na nuvem a função usa `authLevel: function`: a chamada precisa do cabeçalho `x-functions-key` (o BFF envia a chave configurada em `FUNCTION_KEY`).

## Estrutura
- `src/dominio/indicador.ts`: regra de cálculo (função pura, sem rede nem banco)
- `src/functions/indicadorAdocao.ts`: HTTP Trigger (valida parâmetros e chama o domínio)
- `test/`: testes unitários (`node:test`)

## Rodar localmente
Pré-requisito: [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local).
```bash
npm install
cp local.settings.example.json local.settings.json
npm start            # http://localhost:7071/api/indicador-adocao?animais=12&feiras=3
npm test             # testes unitários
```

## Publicar no Azure
Criar um Function App (Node.js 20 ou 22, Linux, plano Consumption) no mesmo grupo de recursos e região do restante do projeto, e publicar com
`func azure functionapp publish <nome-do-function-app>`. URL final: `https://<nome>.azurewebsites.net/api/indicador-adocao`.
