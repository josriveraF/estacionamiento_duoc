-- =================================================================================
-- SISTEMA INTELIGENTE DE GESTIÓN DE ESTACIONAMIENTOS DUOC UC
-- SCHEMA FINAL PARA SUPABASE (POSTGRESQL)
-- =================================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- =================================================================================
-- 2. TABLAS MAESTRAS (USUARIOS Y VEHÍCULOS)
-- =================================================================================

-- Tabla ROLES
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla USUARIOS (Conectado a auth.users de Supabase)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol_id INT REFERENCES public.roles(id) DEFAULT 1, -- 1:Conductor, 2:Guardia, 3:Jefatura, 4:Superadmin
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla VEHICULOS
CREATE TABLE public.vehiculos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    patente VARCHAR(15) UNIQUE NOT NULL,
    marca_modelo VARCHAR(100),
    nfc_tag VARCHAR(100) UNIQUE -- Identificador del chip NFC (Digital o Físico)
);

-- =================================================================================
-- 3. INFRAESTRUCTURA (ESTACIONAMIENTOS)
-- =================================================================================

-- Tabla ESPACIOS (La estructura física del estacionamiento)
CREATE TABLE public.espacios (
    id VARCHAR(10) PRIMARY KEY, -- Ej: 'A-01', 'A-02', 'B-12'
    tipo VARCHAR(50) DEFAULT 'Rotación Alta', -- Rotación Alta, Permanencia Extendida, PMR, Visita
    estado VARCHAR(50) DEFAULT 'Libre', -- Libre, Ocupado, Reservado, Fuera_de_Servicio
    permite_doble_fila BOOLEAN DEFAULT false,
    zona VARCHAR(50) -- Ej: 'Patio Central', 'Subterraneo'
);

-- =================================================================================
-- 4. OPERACIÓN DIARIA Y VALIDACIONES (CORE BUSINESS LOGIC)
-- =================================================================================

-- Tabla REGISTROS_ACCESO (Controlado automáticamente por barrera NFC)
CREATE TABLE public.registros_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id INT REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    guardia_turno_id UUID REFERENCES public.usuarios(id), -- Opcional, si hay un guardia validando
    hora_ingreso TIMESTAMPTZ DEFAULT NOW(),
    hora_salida TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Dentro' -- Dentro, Fuera
);

-- Tabla RESERVAS_ANTICIPADAS (Desde App Conductor antes de llegar)
CREATE TABLE public.reservas_anticipadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    tiempo_estimado VARCHAR(50), -- '1 Hora', '4 Horas', 'Toda la jornada', 'Sin horario fijo'
    estado VARCHAR(20) DEFAULT 'Esperando', -- Esperando, Activa (Ingresó), Cancelada, Expirada
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla OCUPACIONES_FISICAS (Registro Manual Asistido desde la App Conductor una vez dentro)
CREATE TABLE public.ocupaciones_fisicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_acceso_id UUID REFERENCES public.registros_acceso(id) ON DELETE CASCADE,
    vehiculo_id INT REFERENCES public.vehiculos(id),
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    reserva_origen_id UUID REFERENCES public.reservas_anticipadas(id), -- Si vino de una reserva previa
    hora_asignacion TIMESTAMPTZ DEFAULT NOW(),
    hora_liberacion TIMESTAMPTZ, -- Se llena automáticamente cuando sale por la barrera NFC
    estado VARCHAR(20) DEFAULT 'Vigente' -- Vigente, Finalizada
);

-- Tabla INCIDENTES (Casos de "Doble Fila" o "Auto Bloqueado")
CREATE TABLE public.incidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reportador_id UUID REFERENCES public.usuarios(id), -- El usuario que está bloqueado
    patente_infractor VARCHAR(15), -- La patente ingresada manualmente que lo bloquea
    espacio_id VARCHAR(10) REFERENCES public.espacios(id), -- Dónde ocurrió el bloqueo
    notificacion_enviada BOOLEAN DEFAULT false,
    estado VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente, En_Revision (Guardia), Resuelto
    fecha_reporte TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================================
-- 5. TRIGGERS Y FUNCIONES (LIBERACIÓN AUTOMÁTICA EN TIEMPO REAL)
-- =================================================================================

-- Función: Liberar estacionamiento al salir por barrera NFC
CREATE OR REPLACE FUNCTION liberar_espacio_por_nfc()
RETURNS TRIGGER AS $$
BEGIN
    -- Si un registro de acceso pasa a 'Fuera' (salió por barrera)
    IF NEW.estado = 'Fuera' AND OLD.estado = 'Dentro' THEN
        -- 1. Cerrar la ocupación física vigente del vehículo
        UPDATE public.ocupaciones_fisicas
        SET hora_liberacion = NOW(), estado = 'Finalizada'
        WHERE vehiculo_id = NEW.vehiculo_id AND estado = 'Vigente';

        -- 2. Actualizar el estado del espacio a 'Libre'
        UPDATE public.espacios
        SET estado = 'Libre'
        WHERE id = (
            SELECT espacio_id 
            FROM public.ocupaciones_fisicas 
            WHERE vehiculo_id = NEW.vehiculo_id 
            ORDER BY hora_asignacion DESC LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_liberacion_automatica_nfc
AFTER UPDATE ON public.registros_acceso
FOR EACH ROW EXECUTE FUNCTION liberar_espacio_por_nfc();


-- =================================================================================
-- 6. POLÍTICAS DE SEGURIDAD (RLS - Row Level Security)
-- =================================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocupaciones_fisicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_anticipadas ENABLE ROW LEVEL SECURITY;

-- Política Usuarios: Los usuarios solo pueden ver/editar su propio registro. Los superadmins ven todos.
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

-- Política Vehiculos: Conductores solo ven sus vehículos
CREATE POLICY "Conductores ven sus propios vehículos" ON public.vehiculos
    FOR SELECT USING (auth.uid() = usuario_id);

-- =================================================================================
-- 7. POBLAR DATOS BÁSICOS DE INICIO (SEMILLAS)
-- =================================================================================
INSERT INTO public.roles (id, nombre) VALUES 
(1, 'CONDUCTOR'), (2, 'GUARDIA'), (3, 'JEFATURA'), (4, 'SUPERADMIN') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.espacios (id, tipo, estado, zona) VALUES 
('A-01', 'Rotación Alta', 'Libre', 'Sector Norte'), 
('A-02', 'Rotación Alta', 'Libre', 'Sector Norte'), 
('A-03', 'Rotación Alta', 'Ocupado', 'Sector Norte'), 
('B-01', 'Permanencia Extendida', 'Ocupado', 'Sector Sur'),
('B-02', 'Permanencia Extendida', 'Libre', 'Sector Sur')
ON CONFLICT (id) DO NOTHING;
