# T-038.1 - Imagen del frontend de Ideator (build de Vite servido por nginx).
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite resuelve las variables VITE_* en tiempo de build, no de ejecucion: la
# URL de la API tiene que entrar como argumento de build.
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
