# Imagem única do backend NestJS. O serviço que roda é escolhido no build:
#   docker build --build-arg SERVICO=usuarios -t SEU_USUARIO/pjbl/usuarios:v1 .
# SERVICO: usuarios | adocao | geolocalizacao | bff-mobile | api-gateway | notificacao

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
ARG SERVICO
ENV NODE_ENV=production \
    SERVICO=${SERVICO}
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
# a porta vem da variável PORT (nuvem) ou do padrão de cada serviço (3000, 3001, 3101, 3102, 3103)
EXPOSE 3000 3001 3101 3102 3103
CMD ["sh", "-c", "node dist/${SERVICO}/main.js"]
