# Documento de Requerimientos
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos
**Sede:** Duoc UC Maipú

El sistema se divide en **4 servicios principales**, para los cuales se han levantado los siguientes requerimientos funcionales y no funcionales.

## 1. Requerimientos Funcionales por Servicio

### Servicio 1: App Conductor (Frontend Móvil)
* **RF-1.1 - Vista de Ocupación:** El conductor debe poder visualizar un mapa 2D/3D con la disponibilidad de los estacionamientos en tiempo real antes de llegar a la sede.
* **RF-1.2 - Registro de Estacionamiento:** Una vez estacionado, el usuario debe confirmar manualmente el número de espacio ocupado. El sistema validará automáticamente la disponibilidad.
* **RF-1.3 - Reporte de Incidentes (Doble Fila):** El conductor debe poder reportar si su vehículo quedó bloqueado por otro, para que el sistema envíe alertas a los encargados y al conductor bloqueador.

### Servicio 2: App / Panel Guardia (Frontend Tablet/Móvil)
* **RF-2.1 - Escaneo NFC/QR:** El guardia debe poder escanear credenciales para registrar el ingreso y salida, manteniendo un contador del aforo vehicular en tiempo real.
* **RF-2.2 - Asignación Asistida:** Al escanear un ingreso, la app debe sugerir automáticamente un estacionamiento libre (ej. "Ir al 54") para que el guardia dirija al conductor.
* **RF-2.3 - Supervisión en Rondas:** El guardia debe poder seleccionar un espacio en su mapa y verificar la patente del vehículo registrado, permitiéndole corregir datos si hay equivocaciones durante sus rondas.

### Servicio 3: Panel Jefatura y Servicios Generales (Frontend Web)
* **RF-3.1 - Gestión de Reservas y Bloqueos:** Permitir bloquear espacios temporalmente para visitas especiales o mantenimiento, evitando que los conductores los ocupen.
* **RF-3.2 - Dashboard de Estadísticas:** Generar reportes visuales sobre tasas de ocupación, horarios punta y rotación de vehículos.

### Servicio 4: Vista Super Admin (Frontend Web)
* **RF-4.1 - Enrolamiento de Usuarios y Vehículos:** Interfaz para registrar nuevos estudiantes, docentes y vehículos en la base de datos central.
* **RF-4.2 - Gestión de Accesos:** Creación y modificación de cuentas para Guardias y Jefaturas, asignando los roles correspondientes.

---

## 2. Requerimientos No Funcionales (Aplica a los 4 servicios)
* **RNF-01 (Sincronización Realtime):** Los estados de los estacionamientos deben actualizarse en todas las apps y paneles en menos de 500ms utilizando WebSockets.
* **RNF-02 (Rendimiento Híbrido):** Las interfaces de mapa deben procesar componentes 3D con alta eficiencia y superponer datos en 2D nativo para asegurar 60 FPS en móviles.
* **RNF-03 (Disponibilidad y Cloud):** Despliegue en la nube (ej. Vercel) con 99.9% de uptime para soportar las horas punta de ingreso a la sede.
* **RNF-04 (Seguridad):** Aislamiento de datos mediante Row-Level Security (RLS) en la base de datos para prevenir manipulación no autorizada de la ubicación.
