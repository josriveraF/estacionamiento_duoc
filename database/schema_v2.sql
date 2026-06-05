-- =================================================================================
-- SISTEMA INTELIGENTE DE GESTIÓN DE ESTACIONAMIENTOS DUOC UC
-- SCHEMA FINAL V2 PARA SUPABASE (INCLUYE MEJORAS DEL SUPERADMIN)
-- =================================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- =================================================================================
-- 2. TABLAS MAESTRAS (USUARIOS Y VEHÍCULOS)
-- =================================================================================

CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rut VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    rol_id INT REFERENCES public.roles(id) DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vehiculos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    patente VARCHAR(15) UNIQUE NOT NULL,
    marca_modelo VARCHAR(100),
    nfc_tag VARCHAR(100) UNIQUE
);

-- =================================================================================
-- 3. INFRAESTRUCTURA (ESTACIONAMIENTOS Y SENSORES)
-- =================================================================================

CREATE TABLE public.espacios (
    id VARCHAR(10) PRIMARY KEY, -- Ej: 'A-01', 'A-02', 'B-12'
    tipo VARCHAR(50) DEFAULT 'Rotación Alta', -- Rotación Alta, Permanencia Extendida, PMR, Visita
    estado VARCHAR(50) DEFAULT 'Libre', -- Libre, Ocupado, Reservado, Fuera_de_Servicio
    zona VARCHAR(50),
    -- NUEVAS MEJORAS: SOPORTE PARA AUDITORÍA Y SENSORES
    permite_doble_fila BOOLEAN DEFAULT false,
    sensor_desincronizado BOOLEAN DEFAULT false -- Detecta si el sensor físico falló (Superadmin)
);

-- =================================================================================
-- 4. OPERACIÓN DIARIA Y VALIDACIONES
-- =================================================================================

CREATE TABLE public.registros_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id INT REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    guardia_turno_id UUID REFERENCES public.usuarios(id),
    hora_ingreso TIMESTAMPTZ DEFAULT NOW(),
    hora_salida TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Dentro' -- Dentro, Fuera
);

CREATE TABLE public.reservas_anticipadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    tiempo_estimado VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'Esperando', -- Esperando, Activa, Cancelada, Expirada
    fecha_solicitud TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.ocupaciones_fisicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_acceso_id UUID REFERENCES public.registros_acceso(id) ON DELETE CASCADE,
    vehiculo_id INT REFERENCES public.vehiculos(id),
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    reserva_origen_id UUID REFERENCES public.reservas_anticipadas(id),
    hora_asignacion TIMESTAMPTZ DEFAULT NOW(),
    hora_liberacion TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Vigente' -- Vigente, Finalizada
);

CREATE TABLE public.incidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reportador_id UUID REFERENCES public.usuarios(id),
    patente_infractor VARCHAR(15),
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    notificacion_enviada BOOLEAN DEFAULT false,
    estado VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente, En_Revision, Resuelto
    fecha_reporte TIMESTAMPTZ DEFAULT NOW()
);

-- NUEVA TABLA: Fallas de Red y Servidores (Para el Superadmin)
CREATE TABLE public.fallas_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    componente VARCHAR(100) NOT NULL, -- Ej: 'Antena RFID Norte', 'Cámara LPR Acceso'
    estado VARCHAR(20) DEFAULT 'Activo', -- Activo, Resuelto
    fecha_reporte TIMESTAMPTZ DEFAULT NOW(),
    fecha_resolucion TIMESTAMPTZ
);

-- =================================================================================
-- 5. TRIGGERS Y FUNCIONES (AUTOMATIZACIÓN)
-- =================================================================================

-- Función: Liberar estacionamiento al salir por barrera NFC
CREATE OR REPLACE FUNCTION liberar_espacio_por_nfc()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'Fuera' AND OLD.estado = 'Dentro' THEN
        -- 1. Cerrar la ocupación física
        UPDATE public.ocupaciones_fisicas
        SET hora_liberacion = NOW(), estado = 'Finalizada'
        WHERE vehiculo_id = NEW.vehiculo_id AND estado = 'Vigente';

        -- 2. Liberar el espacio (respetando si el sensor no quedó desincronizado)
        UPDATE public.espacios
        SET estado = 'Libre'
        WHERE id = (
            SELECT espacio_id 
            FROM public.ocupaciones_fisicas 
            WHERE vehiculo_id = NEW.vehiculo_id 
            ORDER BY hora_asignacion DESC LIMIT 1
        ) AND sensor_desincronizado = false;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_liberacion_automatica_nfc
AFTER UPDATE ON public.registros_acceso
FOR EACH ROW EXECUTE FUNCTION liberar_espacio_por_nfc();


-- =================================================================================
-- 6. POBLAR DATOS BÁSICOS (SEMILLAS INICIALES 49 ESPACIOS)
-- =================================================================================

INSERT INTO public.roles (id, nombre) VALUES 
(1, 'CONDUCTOR'), (2, 'GUARDIA'), (3, 'JEFATURA'), (4, 'SUPERADMIN') 
ON CONFLICT (id) DO NOTHING;

-- Llenamos los 49 espacios base de los Sectores A, B, C y D para que el mapa inicie sincronizado
INSERT INTO public.espacios (id, tipo, estado, zona) VALUES 
('A-1', 'Rotación Alta', 'Libre', 'Sector Norte'), ('A-2', 'Rotación Alta', 'Ocupado', 'Sector Norte'),
('A-3', 'Rotación Alta', 'Libre', 'Sector Norte'), ('A-4', 'Rotación Alta', 'Libre', 'Sector Norte'),
('A-5', 'Rotación Alta', 'Libre', 'Sector Norte'), ('A-6', 'Rotación Alta', 'Libre', 'Sector Norte'),
('A-7', 'Rotación Alta', 'Libre', 'Sector Norte'), ('A-8', 'Rotación Alta', 'Libre', 'Sector Norte'),
('A-9', 'Rotación Alta', 'Libre', 'Sector Norte'), ('A-10', 'Rotación Alta', 'Reservado', 'Sector Norte'),
('A-11', 'Rotación Alta', 'Libre', 'Sector Norte'),
('B-1', 'Permanencia Extendida', 'Ocupado', 'Sector Este'), ('B-2', 'Permanencia Extendida', 'Ocupado', 'Sector Este'),
('B-3', 'Permanencia Extendida', 'Ocupado', 'Sector Este'), ('B-4', 'Permanencia Extendida', 'Libre', 'Sector Este'),
('B-5', 'Permanencia Extendida', 'Libre', 'Sector Este'), ('B-6', 'Permanencia Extendida', 'Libre', 'Sector Este'),
('B-7', 'Permanencia Extendida', 'Libre', 'Sector Este'), ('B-8', 'Permanencia Extendida', 'Ocupado', 'Sector Este'),
('B-9', 'Permanencia Extendida', 'Libre', 'Sector Este'), ('B-10', 'Permanencia Extendida', 'Libre', 'Sector Este'),
('B-11', 'Permanencia Extendida', 'Libre', 'Sector Este'), ('B-12', 'Carga Eléctrica', 'Libre', 'Sector Este'),
('C-1', 'PMR', 'Libre', 'Sector Oeste'), ('C-2', 'Rotación Alta', 'Ocupado', 'Sector Oeste'),
('C-3', 'Rotación Alta', 'Libre', 'Sector Oeste'), ('C-4', 'Rotación Alta', 'Libre', 'Sector Oeste'),
('C-5', 'Rotación Alta', 'Ocupado', 'Sector Oeste'), ('C-6', 'Rotación Alta', 'Libre', 'Sector Oeste'),
('C-7', 'Rotación Alta', 'Libre', 'Sector Oeste'), ('C-8', 'Rotación Alta', 'Ocupado', 'Sector Oeste'),
('C-9', 'Rotación Alta', 'Libre', 'Sector Oeste'), ('C-10', 'Rotación Alta', 'Ocupado', 'Sector Oeste'),
('C-11', 'Rotación Alta', 'Libre', 'Sector Oeste'), ('C-12', 'Rotación Alta', 'Libre', 'Sector Oeste'),
('D-1', 'Carga Eléctrica', 'Ocupado', 'Sector Sur'), ('D-2', 'Rotación Alta', 'Ocupado', 'Sector Sur'),
('D-3', 'Rotación Alta', 'Ocupado', 'Sector Sur'), ('D-4', 'Rotación Alta', 'Libre', 'Sector Sur'),
('D-5', 'Rotación Alta', 'Libre', 'Sector Sur'), ('D-6', 'Rotación Alta', 'Ocupado', 'Sector Sur'),
('D-7', 'Rotación Alta', 'Libre', 'Sector Sur'), ('D-8', 'Rotación Alta', 'Libre', 'Sector Sur'),
('D-9', 'Rotación Alta', 'Ocupado', 'Sector Sur'), ('D-10', 'Rotación Alta', 'Libre', 'Sector Sur'),
('D-11', 'Rotación Alta', 'Libre', 'Sector Sur'), ('D-12', 'Rotación Alta', 'Ocupado', 'Sector Sur'),
('C-13', 'Carga Eléctrica', 'Libre', 'Sector Oeste'), ('C-14', 'Rotación Alta', 'Ocupado', 'Sector Oeste')
ON CONFLICT (id) DO NOTHING;

-- Insertar algunas fallas simuladas para que el Superadmin tenga métricas
INSERT INTO public.fallas_sistema (componente, estado) VALUES 
('Antena RFID - Acceso Norte', 'Activo'),
('Cámara IA LPR - Patio Central', 'Activo')
ON CONFLICT DO NOTHING;
