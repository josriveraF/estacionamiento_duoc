# Especificación de Requisitos de Software (SRS) - Final Pitch 1
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos
**Sede:** Duoc UC Maipú
**Basado en el estándar:** ISO/IEC/IEEE 29148:2018

---

## 1. Introducción

### 1.1 Propósito
El presente documento constituye la Especificación de Requisitos de Software (SRS) del "Sistema Inteligente de Gestión de Estacionamientos" para la Sede Duoc UC Maipú. Su objetivo es definir de manera completa y precisa los requisitos funcionales, no funcionales y arquitectónicos, sirviendo como entregable central para el **Pitch 1**. Integra la problemática original con la solución propuesta basada en Web, App Móvil, IA y Cloud.

### 1.2 Alcance del Proyecto
El sistema permite la gestión operativa y administrativa de 110 espacios de estacionamiento al interior de la sede. Ante la alta demanda estudiantil, académica y administrativa, la plataforma optimiza la ocupación mediante una arquitectura inteligente sin sensores físicos por cada espacio. El alcance incluye:
* **App Conductor:** Autogestión, registro de ubicación, visualización de disponibilidad y reporte de bloqueos en tiempo real.
* **App / Panel de Guardia:** Vista exclusiva para personal de seguridad para monitoreo en vivo, registro de entradas/salidas vía escaneo NFC/QR, asignación asistida de espacios ("Ve al estacionamiento 54") y validación visual en rondas de supervisión.
* **Panel de Jefaturas y Administración (Super Admin):** Gestión de reglas de negocio, control de capacidad, bloqueos manuales, estadísticas y reportería de uso.

### 1.3 Definiciones y Tecnologías Clave
* **NFC / QR Institucional:** Método principal para validar automatizadamente el ingreso, salida y flujo vehicular por parte de los guardias.
* **Renderizado Híbrido 2D/3D:** Integración visual para entornos interactivos (WebGL/Flutter).
* **Supabase & Vercel:** Tecnologías backend (PostgreSQL + Realtime) y frontend cloud automatizado.

---

## 2. Descripción General del Sistema

### 2.1 Funciones Principales del Producto
1. Registro de usuarios e identificación vehicular mediante NFC/QR.
2. Mapa interactivo de disponibilidad en tiempo real.
3. Registro de ubicación asistido y liberación automática al salir.
4. **Control de aforo:** Contadores en tiempo real de entradas y salidas operados por la App del Guardia.
5. **Asignación de plazas:** Sugerencias automáticas de espacios libres al escanear en portería.
6. Gestión de bloqueos en doble fila y alertas directas.
7. Supervisión en terreno (Rondas del guardia) para validar patentes vs espacios.

### 2.2 Características de los Usuarios
* **Conductor (Estudiantes/Docentes/Visitas):** Requiere aplicación móvil intuitiva para ver disponibilidad antes de llegar, registrar ubicación al estacionar y reportar incidentes.
* **Guardia de Estacionamiento:** Requiere una App móvil/Tablet rápida para escanear accesos, recibir sugerencias de ubicación para conductores, corregir errores de estacionamiento y hacer rondas de supervisión.
* **Jefe de Servicios / Admin:** Requiere herramientas de auditoría, dashboards de rotación, y configuración de restricciones y reservas.

---

## 3. Requisitos Funcionales y Casos de Uso

### 3.1 Resumen de Requisitos Funcionales
* **RF-01:** Control de ingreso/salida y validación NFC en portería (contadores en vivo).
* **RF-02:** Visualización de mapa interactivo y ocupación en vivo.
* **RF-03:** Confirmación manual asistida de ubicación por parte del conductor.
* **RF-04:** Asignación asistida inteligente por parte del guardia.
* **RF-05:** Gestión de incidencias, bloqueos y validación de rondas.

### 3.2 Casos de Uso Detallados

**CU-01: Control de Ingreso y Asignación (Guardia)**
* **Actor:** Guardia, Conductor.
* **Precondición:** Vehículo enrolado llega a portería.
* **Flujo:** 
  1. El guardia escanea la credencial NFC o código QR del conductor desde su App.
  2. El sistema incrementa el contador de vehículos en el recinto.
  3. La App del guardia sugiere un espacio: "Adelante, ve al estacionamiento 54".
* **Postcondición:** Vehículo marcado en tránsito; contador actualizado.

**CU-02: Confirmación de Estacionamiento (Conductor)**
* **Actor:** Conductor.
* **Flujo:** 
  1. Conductor abre la app, selecciona o ingresa el número del espacio (ej. A-12).
  2. El sistema valida la disponibilidad.
  3. El espacio se marca como ocupado.

**CU-03: Liberación Automática de Espacio**
* **Actor:** Guardia, Conductor.
* **Flujo:**
  1. Al salir, el guardia escanea el NFC/QR.
  2. El sistema reduce el contador de ocupación y libera automáticamente el espacio que tenía asignado ese conductor.

**CU-04: Rondas de Supervisión (Guardia)**
* **Actor:** Guardia.
* **Flujo:**
  1. El guardia camina por el recinto visualizando la app.
  2. Selecciona un espacio (ej. B-05) y ve la patente registrada.
  3. Si no coincide con el vehículo físico, emite una alerta o corrige la asignación.

---

## 4. Requisitos No Funcionales

* **RNF-01 (Disponibilidad):** Uptime del 99.9% usando infraestructura Cloud (Vercel + Supabase), asegurando operatividad en horarios punta.
* **RNF-02 (Escalabilidad y Rendimiento):** Sincronización en tiempo real vía WebSockets (Supabase Realtime) sin latencia perceptible para que el mapa se actualice al instante.
* **RNF-03 (Seguridad):** Row-Level Security (RLS) en base de datos.
* **RNF-04 (Accesibilidad):** Interfaces claras y de alto contraste para guardias expuestos a la luz del sol en portería.

---

## 5. Historias de Usuario (HU) - Seleccionadas para Tablero Ágil

### Épica 1: Autogestión del Conductor
* **HU-1.1 - Registro de Ubicación:** Como conductor, quiero poder registrar mi ubicación exacta (ej. número de espacio) al estacionar, para que el sistema sepa dónde estoy.
* **HU-1.2 - Vista de Ocupación:** Como conductor, quiero ver el nivel de ocupación en tiempo real antes de llegar, para decidir si es conveniente ingresar.
* **HU-1.3 - Reporte de Incidentes:** Como conductor, quiero tener un canal directo para reportar si quedé bloqueado en doble fila.

### Épica 2: Control Operativo en Tiempo Real (App del Guardia)
* **HU-2.1 - Escaneo y Contadores:** Como guardia, quiero escanear el NFC/QR del usuario al ingresar/salir, para registrar el flujo y tener contadores exactos del aforo en tiempo real.
* **HU-2.2 - Asignación Asistida:** Como guardia, al escanear un ingreso, quiero que la App me indique un estacionamiento libre sugerido para indicarle al conductor a dónde ir.
* **HU-2.3 - Panel de Ocupación Visual:** Como guardia, quiero un mapa en mi dispositivo que muestre espacios disponibles y ocupados en todo momento.
* **HU-2.4 - Supervisión en Rondas:** Como guardia, quiero visualizar la patente registrada en cada espacio durante mis rondas, para confirmar que el auto correcto esté estacionado ahí y emitir alertas ante equivocaciones.

### Épica 3: Jefaturas y Administración
* **HU-3.1 - Gestión de Reservas:** Como jefe de guardia, quiero bloquear espacios temporalmente para visitas.
* **HU-3.2 - Enrolamiento:** Como Super Admin, quiero registrar nuevos vehículos y conductores.
