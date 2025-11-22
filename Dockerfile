# Etapa 1: Construcción
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Construir para producción
RUN npm run build -- --configuration production

# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Copiar archivos compilados
COPY --from=build /app/dist/datta-able-free-angular-admin-template /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
