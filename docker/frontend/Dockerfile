# docker/frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Быстрый и детерминированный install
ENV CI=true
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Сначала манифесты — кеш слоёв
COPY package*.json ./

RUN npm ci

# Остальной код (понадобится если будете билдить без volume)
COPY . .

EXPOSE 8085

# Dev-server Vite
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8085"]
