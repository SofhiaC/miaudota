#!/usr/bin/env bash
# Regenera os 5 repositórios a partir do monorepo e copia para as pastas dos repositórios git.
# Não mexe no .git de cada pasta: depois você revisa com "git status" e faz commit/push.
#
# Uso (na raiz do monorepo):
#   ./scripts/sincronizar-repositorios.sh --simular          # só mostra o que mudaria
#   ./scripts/sincronizar-repositorios.sh                    # copia de verdade
#   ./scripts/sincronizar-repositorios.sh /outro/caminho     # destino diferente (padrão: ~/Developer/miaudota)
set -euo pipefail
cd "$(dirname "$0")/.."

SIMULAR=""
DESTINO="$HOME/Developer/miaudota"
for arg in "$@"; do
  if [ "$arg" = "--simular" ]; then SIMULAR="-n"; else DESTINO="$arg"; fi
done
REPOS="miaudota-bff miaudota-ms-mongo miaudota-ms-sql miaudota-function miaudota-frontend"

python3 scripts/montar-repositorios.py >/dev/null
echo "Repositórios regenerados em ./repositorios"

for r in $REPOS; do
  if [ ! -d "$DESTINO/$r/.git" ]; then
    echo "ERRO: $DESTINO/$r não existe ou não é um repositório git (falta a pasta .git)." >&2
    exit 1
  fi
done

for r in $REPOS; do
  echo
  echo "=== $r ${SIMULAR:+(simulação)}"
  # --delete remove no destino o que não existe mais na origem; .git, .env e node_modules ficam intactos
  rsync -a --itemize-changes $SIMULAR --delete \
    --exclude '.git' --exclude '.env' --exclude 'node_modules' --exclude 'dist' \
    "repositorios/$r/" "$DESTINO/$r/" | grep -v '/$' | sed 's/^/  /' || true
done

echo
if [ -n "$SIMULAR" ]; then
  echo "Simulação concluída: nada foi copiado. Rode sem --simular para aplicar."
else
  echo "Cópia concluída. Resumo do git em cada repositório:"
  for r in $REPOS; do
    echo "--- $r"
    git -C "$DESTINO/$r" status --short | sed 's/^/  /'
  done
  echo
  echo "Revise e faça o commit/push de cada um (veja o passo a passo)."
fi
