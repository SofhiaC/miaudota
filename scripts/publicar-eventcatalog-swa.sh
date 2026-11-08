#!/usr/bin/env bash
# Compila o EventCatalog e publica no Azure Static Web Apps (cria o recurso na primeira vez).
# Pré-requisitos: ./scripts/montar-eventcatalog.sh já executado, Azure CLI logado (az login), Node 22+.
# Uso: ./scripts/publicar-eventcatalog-swa.sh      (variáveis opcionais: RG, NOME, REGIAO)
set -euo pipefail
cd "$(dirname "$0")/../eventcatalog"

RG="${RG:-rq-miaudota}"
NOME="${NOME:-miaudota-eventcatalog}"
REGIAO="${REGIAO:-centralus}"

command -v az >/dev/null || { echo "Azure CLI não encontrado." >&2; exit 1; }
az account show >/dev/null 2>&1 || { echo "Você não está logado no Azure. Rode: az login" >&2; exit 1; }

echo "1/4 Instalando dependências e compilando o catálogo..."
npm install --no-audit --no-fund
npm run build
[ -d dist ] || { echo "A pasta dist não foi gerada; veja a saída do build acima." >&2; exit 1; }

echo "2/4 Verificando o recurso Static Web App '$NOME'..."
if az staticwebapp show -n "$NOME" -g "$RG" >/dev/null 2>&1; then
  echo "   já existe, será atualizado."
else
  echo "   criando (região $REGIAO, plano Free)..."
  az staticwebapp create -n "$NOME" -g "$RG" -l "$REGIAO" --sku Free >/dev/null
fi

echo "3/4 Enviando os arquivos de ./dist..."
export SWA_CLI_DEPLOYMENT_TOKEN
SWA_CLI_DEPLOYMENT_TOKEN="$(az staticwebapp secrets list -n "$NOME" -g "$RG" --query 'properties.apiKey' -o tsv)"
npx --yes @azure/static-web-apps-cli@latest deploy ./dist --env production

HOST="$(az staticwebapp show -n "$NOME" -g "$RG" --query 'defaultHostname' -o tsv)"
URL="https://$HOST"

echo "4/4 Conferindo se o site responde..."
for i in 1 2 3 4 5 6; do
  CODIGO="$(curl -s -o /dev/null -w '%{http_code}' "$URL" || true)"
  [ "$CODIGO" = "200" ] && break
  sleep 5
done
echo
echo "EventCatalog publicado: $URL (HTTP $CODIGO)"
echo "Use essa URL no arc42 (documentação de eventos) e no README."
