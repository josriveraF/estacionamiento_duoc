# Épicas e Historias de Usuario (EP + HU)
Proyecto: Gestión Inteligente de Estacionamientos

## Épica 1: Autogestión del Conductor
**Descripción:** Proveer a los conductores (estudiantes, docentes, administrativos) de herramientas para autogestionar su experiencia en el estacionamiento, conocer el estado de ocupación y comunicarse con seguridad.

* **HU-1.1 - Registro de Ubicación:** Como conductor, quiero poder registrar mi ubicación exacta (ej. número de espacio o sector) al estacionar, para que el sistema y el personal de seguridad sepan dónde está mi vehículo.
* **HU-1.2 - Vista de Ocupación:** Como conductor, quiero ver el nivel de ocupación en tiempo real del estacionamiento antes de llegar, para decidir si es conveniente ingresar o buscar alternativas.
* **HU-1.3 - Reporte de Incidentes:** Como conductor, quiero tener un canal de comunicación directo para reportar incidentes (ej. golpe a vehículo, vehículo mal estacionado) a la guardia, para que puedan actuar rápidamente.

## Épica 2: Control Operativo en Tiempo Real (Guardia)
**Descripción:** Dotar al personal de portería y guardia de un panel en tiempo real que muestre el estado de los 110 cupos y permita accionar frente a incidencias.

* **HU-2.1 - Escaneo y Control de Acceso:** Como guardia, quiero poder escanear el NFC o QR del usuario al ingresar y salir, para registrar el flujo vehicular y tener contadores en tiempo real (entradas/salidas).
* **HU-2.2 - Asignación Asistida:** Como guardia, al escanear un ingreso, quiero que el sistema me indique un estacionamiento libre (ej. "Ve al estacionamiento 54") para guiar al conductor.
* **HU-2.3 - Panel de Ocupación en Vivo:** Como guardia, quiero tener un panel visual que muestre la cantidad de espacios disponibles y ocupados en tiempo real.
* **HU-2.4 - Supervisión en Rondas:** Como guardia, quiero poder visualizar en la app la ubicación y patente registrada de cada vehículo durante mis rondas, para confirmar que están correctamente estacionados y emitir una alerta si hay equivocación.
* **HU-2.5 - Recepción de Incidentes:** Como guardia, quiero recibir notificaciones de los incidentes reportados por los conductores, para poder atenderlos sin abandonar el puesto o coordinar una ronda.

## Épica 3: Gestión Administrativa y de Seguridad (Jefe de Guardia y Servicios Generales)
**Descripción:** Permitir la toma de decisiones y gestión de reservas por parte de las jefaturas y dirección de sede basadas en datos duros.

* **HU-3.1 - Gestión de Reservas:** Como jefe de guardia, quiero tener la capacidad de reservar y bloquear espacios temporalmente (ej. para visitas importantes o reparaciones), para asegurar su disponibilidad sin conflictos.
* **HU-3.2 - Reportes de Tendencias:** Como jefe de servicios generales, quiero acceder a reportes visuales sobre los horarios peak y tendencias de ocupación, para optimizar los horarios y recursos del campus.

## Épica 4: Administración del Sistema (Super Admin)
**Descripción:** Funcionalidades de base para mantener el sistema seguro y actualizado con los usuarios correctos.

* **HU-4.1 - Enrolamiento de Usuarios:** Como super admin, quiero poder registrar nuevos vehículos y conductores en el sistema, para que puedan utilizar la aplicación y el estacionamiento.
* **HU-4.2 - Gestión de Accesos:** Como super admin, quiero poder crear, editar y eliminar cuentas con roles específicos (Guardia, Jefe de Guardia, Admin), para mantener el control de acceso a la plataforma.
