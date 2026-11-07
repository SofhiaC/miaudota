# Azure Function (Node 20, modelo v4) em container.
#   docker build -t SEU_USUARIO/pjbl/function:v1 .
FROM node:20-alpine AS build
WORKDIR /home/site/wwwroot
COPY package*.json ./
RUN npm ci
COPY tsconfig.json host.json ./
COPY src ./src
RUN npx tsc

FROM mcr.microsoft.com/azure-functions/node:4-node20
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
WORKDIR /home/site/wwwroot
COPY package*.json host.json ./
RUN npm ci --omit=dev
COPY --from=build /home/site/wwwroot/dist ./dist
