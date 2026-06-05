# Etapa 1: Construcción (Build)
FROM node:18-alpine AS build

WORKDIR /app

# Copiar configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# Etapa 2: Servidor Web Nginx
FROM nginx:alpine

# Limpiar el directorio de Nginx por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Crear configuración de Nginx para soportar React Router (SPA Fallback)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root   /usr/share/nginx/html; \
        index  index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 (dentro del contenedor)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
