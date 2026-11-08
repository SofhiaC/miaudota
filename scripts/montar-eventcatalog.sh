#!/usr/bin/env bash
# Cria (na 1ª vez) e atualiza o EventCatalog em ./eventcatalog a partir do conteúdo versionado em ./eventcatalog-conteudo.
# Uso (na raiz do monorepo):  ./scripts/montar-eventcatalog.sh
#
# Na 1ª vez o gerador oficial faz perguntas. Responda: nome da organização = Miaudota e deixe instalar as dependências.
# Depois edite os eventos/serviços em ./eventcatalog-conteudo e rode este script de novo para atualizar.
set -euo pipefail
cd "$(dirname "$0")/.."

command -v node >/dev/null || { echo "Node.js não encontrado." >&2; exit 1; }
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "O EventCatalog exige Node 22 ou superior (você tem $(node -v))." >&2
  echo "Atualize o Node (por exemplo com nvm: nvm install 22) e rode de novo." >&2
  exit 1
fi

if [ ! -f eventcatalog/package.json ]; then
  echo "Criando o projeto base do EventCatalog em ./eventcatalog ..."
  npx --yes @eventcatalog/create-eventcatalog@latest eventcatalog --empty
fi

echo "Copiando o conteúdo do Miaudota para o catálogo ..."
for pasta in domains services events channels users; do
  mkdir -p "eventcatalog/$pasta"
  rsync -a "eventcatalog-conteudo/$pasta/" "eventcatalog/$pasta/"
done

# título amigável, só se a configuração ainda tiver o padrão
python3 - <<'PY'
from pathlib import Path
for nome in ('eventcatalog.config.js', 'eventcatalog.config.mjs', 'eventcatalog.config.cjs'):
    p = Path('eventcatalog') / nome
    if p.exists():
        t = p.read_text(encoding='utf-8')
        for velho in ("title: 'EventCatalog'", 'title: "EventCatalog"'):
            if velho in t:
                p.write_text(t.replace(velho, "title: 'Miaudota - EventCatalog'"), encoding='utf-8')
                print('título atualizado em', nome)
PY

echo
echo "Pronto. Para ver o catálogo:"
echo "  cd eventcatalog && npm install && npm run dev      # abre em http://localhost:3000"
