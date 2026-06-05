# Diagrama de Secuencia (UML)
**Proyecto:** Sistema Inteligente de Gestión de Estacionamientos
**Arquitectura:** Frontend Angular + Backend (Supabase/API)

El siguiente diagrama de secuencia en **Mermaid.js** ilustra el flujo de comunicación y la estructura completa de un servicio principal: **El ingreso mediante NFC y la confirmación de la ubicación**, demostrando cómo interactúa el Frontend en Angular con el Backend y la Base de Datos.

## Código Mermaid.js

```mermaid
sequenceDiagram
    autonumber
    actor Conductor
    actor Guardia
    participant SensorNFC as Lector NFC (Portería)
    participant AngularFrontend as Frontend (Angular App)
    participant BackendAPI as API Backend (Supabase)
    participant Realtime as WebSockets (Realtime)
    participant Database as Base de Datos (PostgreSQL)

    %% Flujo de Ingreso
    Conductor->>SensorNFC: Acerca credencial (Ingreso al recinto)
    SensorNFC->>BackendAPI: POST /api/ingresos {nfc_tag}
    BackendAPI->>Database: INSERT Ocupacion (estado: 'En_Curso')
    Database-->>BackendAPI: OK (id_ocupacion)
    
    %% Sincronización en Tiempo Real al Guardia
    BackendAPI->>Realtime: Emitir evento 'nuevo_ingreso'
    Realtime-->>AngularFrontend: WebSocket Event (Aforo +1)
    AngularFrontend->>Guardia: Mostrar sugerencia "Ir a A-12"

    %% Confirmación de Ubicación por el Conductor
    Conductor->>AngularFrontend: Abre la App Angular y selecciona 'A-12'
    AngularFrontend->>BackendAPI: PUT /api/ocupacion/ubicacion {espacio: 'A-12'}
    
    %% Validación de Backend
    BackendAPI->>Database: SELECT estado FROM Espacios WHERE id = 'A-12'
    Database-->>BackendAPI: estado: 'Libre'
    
    BackendAPI->>Database: UPDATE Espacios SET estado = 'Ocupado'
    Database-->>BackendAPI: OK
    
    %% Respuesta al Frontend
    BackendAPI-->>AngularFrontend: 200 OK (Estacionamiento Confirmado)
    AngularFrontend-->>Conductor: Muestra "Estacionamiento A-12 Confirmado"

    %% Sincronización a todos los clientes (Angular)
    BackendAPI->>Realtime: Emitir evento 'espacio_ocupado' {espacio: 'A-12'}
    Realtime-->>AngularFrontend: WebSocket Event (Actualizar Mapa)
    AngularFrontend->>AngularFrontend: Angular re-renderiza el mapa (Espacio A-12 en Rojo)
```

### 💬 Prompt para generar este Diagrama de Secuencia en otra IA:
> **Copia y pega lo siguiente:**
> *"Actúa como Arquitecto de Software. Créame un Diagrama de Secuencia UML usando Mermaid.js. El flujo debe mostrar cómo un Frontend desarrollado en Angular interactúa con un Backend (API) y una Base de Datos en un sistema de estacionamientos. Participantes: Conductor, Guardia, Sensor NFC, Frontend Angular, API Backend, WebSockets (Realtime) y Base de Datos (PostgreSQL). El flujo debe ser: 1. El conductor acerca el NFC al sensor. 2. El sensor notifica a la API. 3. La API guarda en BD. 4. La API notifica por WebSocket al Frontend del guardia que el aforo subió. 5. El Conductor en su App Angular selecciona el estacionamiento A-12. 6. El Frontend Angular envía la petición a la API. 7. La API valida en BD que esté libre. 8. La API actualiza la BD y responde OK al Angular. 9. La API emite un evento WebSocket a todos los frontends Angular para pintar el mapa de color rojo en ese espacio."*
