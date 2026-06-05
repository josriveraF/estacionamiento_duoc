# Presentación - Pitch 1
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos

## 1. El Problema (Contexto)
Buenas tardes. En Duoc UC Sede Maipú tenemos un problema crítico: Con 11.000 estudiantes y cientos de docentes, la gestión de nuestros 110 estacionamientos está colapsada. Actualmente solo contamos con una barrera automatizada que registra el acceso, pero **no tenemos datos de ocupación, no sabemos dónde están estacionados los autos, y los guardias no pueden guiar a los conductores**. Esto genera doble fila, bloqueos, pérdida de tiempo y fricción entre la comunidad.

## 2. La Solución (Nuestra Propuesta)
Nuestra propuesta es un ecosistema digital compuesto por **4 servicios integrados** que optimizan los estacionamientos sin necesidad de instalar costosos sensores físicos por cada espacio:

1. **App Conductor:** El conductor ve un mapa 2D/3D con espacios disponibles antes de llegar y, al estacionar, confirma manualmente su ubicación exacta en la App.
2. **App del Guardia:** La herramienta en terreno. El guardia escanea el NFC en portería (llevando un contador de aforo exacto) y el sistema le sugiere por dónde guiar al conductor (ej. "Ve al 54"). Además, en sus rondas, usa la App para verificar visualmente que la patente corresponda al estacionamiento registrado.
3. **Panel de Jefatura (Servicios Generales):** Una vista web que permite bloquear espacios por mantenimiento o reservas VIP, y que entrega reportes de rotación para la toma de decisiones.
4. **Vista Super Admin:** El panel de control total para enrolar vehículos y gestionar a los usuarios del sistema.

## 3. Arquitectura y Escalabilidad
Lograremos esto desarrollando sobre plataformas escalables en la nube:
* **Frontend Híbrido:** Usaremos React/Flutter, separando la renderización de un mapa 3D interactivo con componentes 2D nativos para asegurar que funcione fluido en todos los móviles.
* **Backend y Tiempo Real:** Utilizaremos **Supabase** (PostgreSQL) y **WebSockets**. Esto significa que cuando un conductor confirma su espacio, o un guardia escanea un auto para que salga, el espacio se libera o se ocupa **instantáneamente en todas las pantallas en menos de medio segundo**.
* **Despliegue:** Todo automatizado hacia la nube (Vercel/Google Cloud) protegido con altos estándares de seguridad (Row-Level Security).

## 4. Cierre
Con este sistema, empoderamos al guardia, le damos visibilidad al conductor y entregamos datos reales a la dirección. Hemos levantado y documentado el 100% de los requerimientos e historias de usuario de estos 4 servicios para este Checkpoint 1 y nuestro Tablero Ágil ya está listo para comenzar el desarrollo en el próximo Sprint. Muchas gracias.
