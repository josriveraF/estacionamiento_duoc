# Guía de Despliegue en Amazon EC2 (Ubuntu)

Esta guía te ayudará a subir todo el proyecto a una instancia de Amazon EC2 y poner a correr las cuatro aplicaciones simultáneamente utilizando Docker y Docker Compose.

## 1. Preparativos en AWS
1. Entra a tu consola de AWS y lanza una instancia **EC2** con sistema operativo **Ubuntu Server**.
2. Asegúrate de configurar el **Security Group** (Reglas de entrada) para permitir tráfico en los siguientes puertos:
   - Puerto `22` (SSH para conectarte)
   - Puerto `80` (HTTP) y `443` (HTTPS) - Opcional, pero recomendado si usarás dominio.
   - Puerto `8081` (App Conductor)
   - Puerto `8082` (App Guardia)
   - Puerto `8083` (Panel Jefatura)
   - Puerto `8084` (Vista Superadmin)

## 2. Conectarse a la instancia EC2
Abre tu terminal y conéctate a tu servidor usando la llave `.pem` que te entregó AWS:
```bash
ssh -i "tu-llave.pem" ubuntu@tu-ip-publica-ec2
```

## 3. Instalar Docker y Docker Compose
Ejecuta los siguientes comandos uno por uno en tu servidor EC2:
```bash
# Actualizar los paquetes
sudo apt-get update
sudo apt-get upgrade -y

# Instalar Docker
sudo apt-get install docker.io -y

# Iniciar el servicio de Docker
sudo systemctl start docker
sudo systemctl enable docker

# Instalar Docker Compose
sudo apt-get install docker-compose-v2 -y

# (Opcional) Darle permisos a tu usuario ubuntu para correr docker sin sudo
sudo usermod -aG docker ubuntu
# Si haces esto último, cierra sesión (exit) y vuelve a entrar por SSH.
```

## 4. Subir los archivos al Servidor
La forma más fácil de subir tu código es usando Git.
1. Sube tu carpeta `esatcionamiento` a GitHub, GitLab o Bitbucket.
2. En tu servidor EC2, clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

*(Si no usas Git, puedes usar un cliente SFTP como FileZilla o el comando `scp` para copiar toda la carpeta al servidor).*

## 5. Iniciar todo el sistema
Una vez dentro de la carpeta del proyecto en el EC2 (donde está el archivo `docker-compose.yml`), ejecuta este comando mágico:

```bash
sudo docker compose up -d --build
```

Esto descargará Node.js, compilará todas tus 4 aplicaciones React y configurará 4 servidores web Nginx de forma automática. Tardará unos un par de minutos.

## 6. ¡Probar el acceso!
Una vez que el comando termine, abre tu navegador web y entra a las siguientes direcciones usando la IP Pública de tu servidor EC2:

- **App Conductor:** `http://TU-IP-EC2:8081`
- **App Guardia:** `http://TU-IP-EC2:8082`
- **Panel Jefatura:** `http://TU-IP-EC2:8083`
- **Vista Superadmin:** `http://TU-IP-EC2:8084`

¡Listo! Todos tus sistemas estarán corriendo de forma ininterrumpida y conectados a tu base de datos Supabase alojada en la nube.
