# Épicas e Historias de Usuario (EP + HU)
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos

Se han definido 4 Épicas principales correspondientes a los 4 servicios que se implementarán en la plataforma.

## Épica 1: Servicio App Conductor (Autogestión y Visualización)
**Descripción:** Proveer a estudiantes y docentes una app móvil para asegurar un flujo ordenado y autogestionado.

* **HU-1.1 - Mapa de Disponibilidad:** Como conductor, quiero visualizar un mapa en tiempo real con los espacios libres, para saber hacia dónde dirigirme al llegar.
* **HU-1.2 - Confirmación de Ubicación:** Como conductor, quiero poder registrar el número de estacionamiento donde dejé mi vehículo, para informar al sistema mi ubicación exacta.
* **HU-1.3 - Reporte de Bloqueos:** Como conductor, quiero reportar rápidamente si mi vehículo quedó bloqueado por otro en doble fila, para que seguridad me asista.

## Épica 2: Servicio App Guardia (Control de Acceso y Rondas)
**Descripción:** Dotar a los guardias de una herramienta ágil para registrar el flujo vehicular y realizar auditorías en terreno.

* **HU-2.1 - Escaneo NFC y Contadores:** Como guardia, quiero escanear el pase del conductor al ingresar y salir, para que el sistema lleve el conteo exacto de aforo vehicular.
* **HU-2.2 - Sugerencia de Asignación:** Como guardia, al escanear un ingreso quiero que la app me indique en pantalla un número de estacionamiento libre (ej. "Ve al 54") para guiar al conductor.
* **HU-2.3 - Supervisión de Rondas:** Como guardia, al hacer mis rondas quiero seleccionar un espacio en el mapa de mi app para ver la patente que debería estar ahí, y así validar si el conductor se estacionó correctamente.

## Épica 3: Servicio Panel Jefatura / Servicios Generales (Administración Operativa)
**Descripción:** Plataforma web para el control, la estrategia y el análisis de la ocupación por parte de las jefaturas de sede.

* **HU-3.1 - Gestión de Bloqueos (Reservas):** Como Jefe de Seguridad, quiero poder marcar estacionamientos como "Reservados/Bloqueados" en el mapa, para guardar espacios para autoridades o mantenimiento.
* **HU-3.2 - Reportes de Tendencia:** Como Jefe de Servicios Generales, quiero ver gráficos de los horarios peak y tasas de ocupación semanal, para tomar decisiones sobre la infraestructura.

## Épica 4: Servicio Vista Super Admin (Configuración Base)
**Descripción:** Panel de administración de alto nivel para gestionar la infraestructura tecnológica y las bases de datos de usuarios.

* **HU-4.1 - Enrolamiento Masivo:** Como Super Admin, quiero poder cargar planillas o registrar nuevos vehículos asociados a rut/correo, para que puedan ingresar al recinto.
* **HU-4.2 - Gestión de Roles:** Como Super Admin, quiero crear y modificar cuentas otorgando roles específicos (ej. convertir una cuenta en Guardia o Jefe de Seguridad), para mantener la seguridad del sistema.
