# Etapa 1 - Build do Angular
FROM node:18 AS frontend-build

WORKDIR /app/frontend
COPY angular/ .
RUN npm install
RUN npm install -g @angular/cli
RUN ng build

# Etapa 2 - Back-end com Angular estático + servidor
FROM node:18 AS backend-build

WORKDIR /app
COPY server/ ./server
COPY --from=frontend-build /app/frontend/dist /app/server/dist

WORKDIR /app/server
RUN npm install

# Etapa 3 - Imagem final com PostgreSQL, backend e frontend
FROM postgres:15

# Instala Node.js
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g @angular/cli && \
    apt-get clean

# Configura banco
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=todo_db

# Copia app
WORKDIR /app
COPY --from=backend-build /app/server /app

# Expor portas
EXPOSE 5432
EXPOSE 3000
EXPOSE 4200

# Inicializa PostgreSQL e executa app
CMD service postgresql start && \
    npm install && \
    ng serve --host 0.0.0.0 --port 4200 & \
    node index.js
