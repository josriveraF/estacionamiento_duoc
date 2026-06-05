# Modelo de Solución y Arquitectura
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos

## 1. Modelo de Solución
La solución propone eliminar la necesidad de costosos sensores físicos por cajón de estacionamiento, reemplazándolos por un **modelo híbrido de validación humana y tecnológica**. El flujo principal se basa en:

1. **Ingreso:** El vehículo entra a la sede; el Guardia escanea el NFC/QR del conductor, lo que incrementa el contador de aforo y le sugiere un estacionamiento específico.
2. **Estacionamiento:** El conductor confirma en su App el número exacto del espacio donde se estacionó.
3. **Supervisión Continua:** Durante sus rondas, el Guardia verifica en su propia App que el auto estacionado coincida con la patente registrada en el sistema.
4. **Salida:** Al salir, el escaneo NFC libera automáticamente el espacio, haciéndolo disponible inmediatamente para otros.

## 2. Arquitectura de Sistemas
El sistema opera sobre una arquitectura moderna basada en la nube, garantizando tiempo real y escalabilidad para los 4 servicios.

### Frontend (Las 4 Aplicaciones/Vistas)
* **Framework:** React / React Native (o Flutter para móviles).
* **Renderizado Visual:** Motor WebGL o Three.js para la carga del mapa 3D de estacionamientos, combinado con elementos HTML/CSS (DOM) o CustomPaint (Flutter) superpuestos en 2D para mantener el texto nítido y asegurar 60 FPS.
* **Despliegue:** Integración continua a través de GitHub Actions hacia Vercel o Google Cloud Run.

### Backend y Base de Datos
* **Base de Datos:** PostgreSQL alojada en **Supabase**.
* **Tiempo Real:** Uso de WebSockets a través de *Supabase Realtime* para emitir los cambios de estado (ocupado/libre) a todas las aplicaciones conectadas en milisegundos.
* **Autenticación:** Firebase Authentication u OAuth para manejar los roles (Super Admin, Jefe de Seguridad, Guardia, Conductor).

### Componentes de Inteligencia y Automatización (Futuro)
* Integración con **Google AI Studio** para predecir flujos vehiculares y recomendar cierres temporales de sectores en base al historial almacenado.
