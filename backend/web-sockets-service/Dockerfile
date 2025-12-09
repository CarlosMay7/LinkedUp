# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./

# Instalar todas las dependencias (necesarias para build)
RUN npm install

COPY . .

# Build usando tsc directamente (evita el error de chalk con nest build)
RUN npx tsc -p tsconfig.build.json

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev && npm cache clean --force

# Copiar código compilado desde builder
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3002

CMD ["node", "dist/main"]
