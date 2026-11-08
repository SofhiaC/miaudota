#!/usr/bin/env bash
# Publica no Azure Container Apps os 5 serviços HTTP do Miaudota, na ordem certa,
# usando as imagens do Docker Hub e os valores de scripts/segredos.env.
# Uso:  ./scripts/deploy-azure.sh            (todos)
#       ./scripts/deploy-azure.sh usuarios   (só um: usuarios | adocao | geolocalizacao | bff | gateway | notificacao)
# O worker de notificacao não tem URL pública: só consome o RabbitMQ e chama o webhook do n8n (N8N_WEBHOOK_URL).
set -euo pipefail
cd "$(dirname "$0")"

RG="${RG:-rq-miaudota}"
ENV_NAME="${ENV_NAME:-miaudota-env}"
HUB="${HUB:-sofhiachromiec}"
VERSAO="${VERSAO:-v1}"
MIN_REPLICAS="${MIN_REPLICAS:-1}"

[ -f segredos.env ] || { echo "Falta scripts/segredos.env (copie de segredos.env.example e preencha)."; exit 1; }
# shellcheck disable=SC1091
source segredos.env
for v in INTERNAL_API_KEY JWT_SECRET MONGO_URI_USUARIOS MONGO_URI_ADOCAO RABBITMQ_URL SQL_SERVER SQL_DATABASE SQL_USER SQL_PASSWORD FUNCTION_URL FUNCTION_KEY; do
  [ -n "${!v:-}" ] || { echo "Variável $v vazia em segredos.env"; exit 1; }
done

fqdn() { az containerapp show -n "$1" -g "$RG" --query properties.configuration.ingress.fqdn -o tsv 2>/dev/null || true; }
url_de() { local f; f="$(fqdn "$1")"; [ -n "$f" ] && echo "https://$f" || echo ""; }

# implantar <app> <imagem> <porta> <secrets...> -- <env-vars...>
implantar() {
  local app="$1" img="$2" porta="$3"; shift 3
  local secrets=() envs=() alvo=secrets
  for a in "$@"; do
    if [ "$a" = "--" ]; then alvo=envs; continue; fi
    if [ "$alvo" = secrets ]; then secrets+=("$a"); else envs+=("$a"); fi
  done
  echo "=== $app"
  if az containerapp show -n "$app" -g "$RG" >/dev/null 2>&1; then
    az containerapp delete -n "$app" -g "$RG" --yes >/dev/null
  fi
  az containerapp create -n "$app" -g "$RG" --environment "$ENV_NAME" \
    --image "docker.io/$HUB/pjbl-$img:$VERSAO" \
    --target-port "$porta" --ingress external \
    --cpu 0.25 --memory 0.5Gi --min-replicas "$MIN_REPLICAS" --max-replicas 1 \
    --secrets "${secrets[@]}" --env-vars "${envs[@]}" "NODE_ENV=production" "PORT=$porta" \
    --query properties.configuration.ingress.fqdn -o tsv
}

# worker sem porta HTTP (sem ingress): fica ligado consumindo a fila
implantar_worker() {
  local app="$1" img="$2"; shift 2
  local secrets=() envs=() alvo=secrets
  for a in "$@"; do
    if [ "$a" = "--" ]; then alvo=envs; continue; fi
    if [ "$alvo" = secrets ]; then secrets+=("$a"); else envs+=("$a"); fi
  done
  echo "=== $app (worker)"
  if az containerapp show -n "$app" -g "$RG" >/dev/null 2>&1; then
    az containerapp delete -n "$app" -g "$RG" --yes >/dev/null
  fi
  az containerapp create -n "$app" -g "$RG" --environment "$ENV_NAME" \
    --image "docker.io/$HUB/pjbl-$img:$VERSAO" \
    --cpu 0.25 --memory 0.5Gi --min-replicas 1 --max-replicas 1 \
    --secrets "${secrets[@]}" --env-vars "${envs[@]}" "NODE_ENV=production" \
    --query properties.provisioningState -o tsv
}

alvo="${1:-todos}"
quero() { [ "$alvo" = todos ] || [ "$alvo" = "$1" ]; }

if quero usuarios; then
  implantar miaudota-usuarios usuarios 3101 \
    "jwt=$JWT_SECRET" "chave=$INTERNAL_API_KEY" "mongo=$MONGO_URI_USUARIOS" "rabbit=$RABBITMQ_URL" -- \
    JWT_SECRET=secretref:jwt INTERNAL_API_KEY=secretref:chave MONGO_URI_USUARIOS=secretref:mongo RABBITMQ_URL=secretref:rabbit
fi

URL_USUARIOS="$(url_de miaudota-usuarios)"
if quero adocao; then
  [ -n "$URL_USUARIOS" ] || { echo "Suba o usuarios antes."; exit 1; }
  implantar miaudota-adocao adocao 3102 \
    "chave=$INTERNAL_API_KEY" "mongo=$MONGO_URI_ADOCAO" "rabbit=$RABBITMQ_URL" -- \
    INTERNAL_API_KEY=secretref:chave MONGO_URI_ADOCAO=secretref:mongo RABBITMQ_URL=secretref:rabbit \
    "URL_USUARIOS=$URL_USUARIOS"
fi

URL_ADOCAO="$(url_de miaudota-adocao)"
if quero geolocalizacao; then
  [ -n "$URL_ADOCAO" ] || { echo "Suba o adocao antes."; exit 1; }
  implantar miaudota-geolocalizacao geolocalizacao 3103 \
    "chave=$INTERNAL_API_KEY" "sqlpwd=$SQL_PASSWORD" "rabbit=$RABBITMQ_URL" -- \
    INTERNAL_API_KEY=secretref:chave SQL_PASSWORD=secretref:sqlpwd RABBITMQ_URL=secretref:rabbit \
    "SQL_SERVER=$SQL_SERVER" "SQL_DATABASE=$SQL_DATABASE" "SQL_USER=$SQL_USER" \
    SQL_ENCRYPT=true SQL_TRUST_CERT=false SQL_CRIAR_BANCO=false \
    "URL_USUARIOS=$URL_USUARIOS" "URL_ADOCAO=$URL_ADOCAO"
fi

URL_GEOLOCALIZACAO="$(url_de miaudota-geolocalizacao)"
if quero bff; then
  [ -n "$URL_GEOLOCALIZACAO" ] || { echo "Suba a geolocalizacao antes."; exit 1; }
  implantar miaudota-bff bff 3001 \
    "chave=$INTERNAL_API_KEY" "funckey=$FUNCTION_KEY" -- \
    INTERNAL_API_KEY=secretref:chave FUNCTION_KEY=secretref:funckey \
    "FUNCTION_URL=$FUNCTION_URL" \
    "URL_USUARIOS=$URL_USUARIOS" "URL_ADOCAO=$URL_ADOCAO" "URL_GEOLOCALIZACAO=$URL_GEOLOCALIZACAO"
fi

URL_BFF="$(url_de miaudota-bff)"
if quero gateway; then
  [ -n "$URL_BFF" ] || { echo "Suba o bff antes."; exit 1; }
  implantar miaudota-gateway gateway 3000 \
    "jwt=$JWT_SECRET" "chave=$INTERNAL_API_KEY" -- \
    JWT_SECRET=secretref:jwt INTERNAL_API_KEY=secretref:chave \
    "URL_BFF=$URL_BFF"
fi

if [ "$alvo" = notificacao ] || [ "$alvo" = todos ]; then
  if [ -n "${N8N_WEBHOOK_URL:-}" ]; then
    implantar_worker miaudota-notificacao notificacao \
      "rabbit=$RABBITMQ_URL" "n8n=$N8N_WEBHOOK_URL" "n8ntoken=${N8N_WEBHOOK_TOKEN:-sem-token}" -- \
      RABBITMQ_URL=secretref:rabbit N8N_WEBHOOK_URL=secretref:n8n N8N_WEBHOOK_TOKEN=secretref:n8ntoken
  elif [ "$alvo" = notificacao ]; then
    echo "Defina N8N_WEBHOOK_URL em segredos.env."; exit 1
  else
    echo "(notificacao ignorada: N8N_WEBHOOK_URL não definido em segredos.env)"
  fi
fi

echo
echo "URLs públicas:"
for a in usuarios adocao geolocalizacao bff gateway; do
  u="$(url_de "miaudota-$a")"; [ -n "$u" ] && echo "  $a: $u   (Swagger: $u/docs)"
done
