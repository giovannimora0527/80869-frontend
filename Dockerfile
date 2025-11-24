# ===============================
# ETAPA 1: COMPILAR ANGULAR
# ===============================
FROM node:18-alpine AS build

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Construimos la app en modo producción
RUN npm run build -- --configuration production

# ===============================
# ETAPA 2: SERVIR CON NGINX
# ===============================
FROM nginx:1.27-alpine

# Carpeta donde Nginx sirve archivos estáticos
WORKDIR /usr/share/nginx/html

# Borramos contenido por defecto de Nginx
RUN rm -rf ./*

# ⚠ IMPORTANTE:
# Ajustar la ruta según lo que genere Angular en /dist
# Muchas veces es dist/80869-frontend, en otras dist/80869-frontend/browser
COPY --from=build /app/dist ./

# Exponemos el puerto 80 dentro del contenedor
EXPOSE 80

# Arrancamos Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
