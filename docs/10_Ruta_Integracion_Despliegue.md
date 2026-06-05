# Hoja de Ruta: Integración y Despliegue de los 4 Servicios
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos
**Objetivo:** Definir los pasos técnicos faltantes para desarrollar, conectar a la base de datos y desplegar cada una de las carpetas de nuestra arquitectura.

---

## 1. Estado Actual y Rol de Cada Carpeta
Hemos estructurado el proyecto dejando la carpeta `frontend/` con las **4 aplicaciones independientes**. Esto es crucial porque nos permite desplegar cada servicio por separado según su naturaleza tecnológica (2 Apps Móviles y 2 Plataformas Web).

* 📱 `frontend/1_app-conductor`: **Mobile App** (React Native/Ionic) enfocada en UX móvil, mapas y geolocalización.
* 📱 `frontend/2_app-guardia`: **Tablet/Mobile App** (React Native/Ionic) enfocada en escanear NFC, cámara y notificaciones push.
* 💻 `frontend/3_panel-jefatura`: **Web App** (React/Angular) enfocada en gráficos (Dashboards), tablas y resoluciones de escritorio.
* 💻 `frontend/4_vista-superadmin`: **Web App** (React/Angular) enfocada en formularios pesados, CRUD de usuarios y tablas de administración.
* 🗄️ `database/`: Aquí guardaremos los scripts SQL para crear las tablas y las reglas de seguridad.
* ⚙️ `backend/`: Para almacenar funciones que corren en el servidor (Supabase Edge Functions), por ejemplo, si necesitamos enviar correos o notificaciones push masivas.

---

## 2. ¿Qué falta para conectar los 4 Sistemas? (Integración Interna)

Para que los 4 sistemas "hablen" entre sí, todos deben conectarse a una única fuente de verdad: **El Proyecto de Supabase**.

### A. Preparar la Base de Datos (Carpeta `database/`)
1. **Crear el Proyecto en Supabase:** Obtener la `URL_BASE` y la `ANON_KEY`.
2. **Ejecutar el Modelo de Datos:** Correr los scripts SQL que levanten las tablas que diseñamos en el UML (`USUARIOS`, `VEHICULOS`, `ESPACIOS`, `REGISTROS_ACCESO`, etc.).
3. **Configurar RLS (Row-Level Security):** Esto es crítico. Debemos programar en la BD que un usuario desde `1_app-conductor` NO pueda borrar reservas, pero que un usuario desde `4_vista-superadmin` sí pueda.

### B. Inicializar los 4 Frontends
En cada una de las 4 carpetas de `frontend/` falta ejecutar los comandos de inicialización (ej. `npx create-react-app` o `npx create-expo-app`) y configurar el **Cliente de Supabase**.

1. **En las Apps (Carpetas 1 y 2):**
   * Falta instalar librerías de lectura NFC/QR (`react-native-nfc-manager` o `html5-qrcode`).
   * Falta configurar **Supabase Realtime** (WebSockets) para escuchar cuando la tabla `REGISTROS_ACCESO` cambie y actualizar los contadores al instante.
2. **En las Webs (Carpetas 3 y 4):**
   * Falta instalar librerías de gráficos (`Chart.js` o `Recharts`).
   * Falta configurar el inicio de sesión (`Supabase Auth`).

---

## 3. Hoja de Ruta de Despliegue (Deploy)

Dado que tenemos naturalezas distintas (Web vs App), el despliegue se divide en dos estrategias:

### 🚀 Despliegue de los Paneles Web (Carpetas 3 y 4)
Al ser React o Angular, la forma más rápida y robusta de conectar esto es usando **Vercel** o **Firebase Hosting**.
1. **Paso 1:** Subiremos el código de `3_panel-jefatura` y `4_vista-superadmin` a repositorios en **GitHub**.
2. **Paso 2:** Conectaremos Vercel a GitHub. Así, cada vez que hagamos un cambio en el código, los paneles web se actualizarán automáticamente en una URL pública (ej. `panel-guardia-duoc.vercel.app`).
3. **Paso 3:** Se inyectan las variables de entorno de Supabase de forma segura en los servidores de Vercel.

### 📲 Despliegue de las Apps Móviles (Carpetas 1 y 2)
Al ser aplicaciones que usarán hardware (NFC y Cámara), la compilación requiere otro proceso.
1. **Paso 1:** Desarrollar usando **Expo** (si es React Native), lo que nos permitirá probar las apps en vivo escaneando un QR con nuestros teléfonos durante el desarrollo.
2. **Paso 2:** Generar los archivos empaquetados:
   * `.APK` / `.AAB` para Android.
   * Compilación mediante TestFlight para dispositivos iOS (Apple).
3. **Paso 3:** Distribuir estas aplicaciones de manera interna a los guardias en las tablets de la sede, y a los estudiantes mediante las tiendas oficiales o links directos.

---

## Próximo Paso Recomendado (Inicio Técnico)
Con el Checkpoint 1 terminado, el siguiente paso inmediato para empezar el **Checkpoint 2** es:
* Seleccionar una de las carpetas (ej. `3_panel-jefatura` o `4_vista-superadmin`).
* Inicializar el proyecto base con React/Angular (`npm create vite@latest` o `ng new`).
* Empezar a generar los componentes de interfaz (Botones, Tablas, Mapas) guiándonos por los Prompts de Figma que generamos.
