-- Modelo Físico: Sistema Inteligente de Gestión de Estacionamientos
-- Diseñado para PostgreSQL (Supabase)

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- 2. TABLAS

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
    rol_id INT REFERENCES public.roles(id) DEFAULT 1, -- 1: Conductor
    activo BOOLEAN DEFAULT true,
    fecha_registro TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla VEHICULOS
CREATE TABLE public.vehiculos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    patente VARCHAR(15) UNIQUE NOT NULL,
    marca VARCHAR(100),
    nfc_tag VARCHAR(100) UNIQUE -- Identificador del chip NFC
);

-- Tabla ESPACIOS (La estructura física del estacionamiento)
CREATE TABLE public.espacios (
    id VARCHAR(10) PRIMARY KEY, -- Ej: 'A-12'
    tipo VARCHAR(50) DEFAULT 'Normal', -- Normal, Visita, Autoridad, PMR
    estado VARCHAR(50) DEFAULT 'Libre', -- Libre, Ocupado, Reservado, Bloqueado
    permite_doble_fila BOOLEAN DEFAULT false
);

-- Tabla REGISTROS_ACCESO (Controlado por el Guardia en Portería)
CREATE TABLE public.registros_acceso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id INT REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    guardia_entrada_id UUID REFERENCES public.usuarios(id),
    guardia_salida_id UUID REFERENCES public.usuarios(id),
    hora_ingreso TIMESTAMPTZ DEFAULT NOW(),
    hora_salida TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Dentro' -- Dentro, Fuera
);

-- Tabla OCUPACIONES_FISICAS (Confirmado por el Conductor)
CREATE TABLE public.ocupaciones_fisicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registro_acceso_id UUID REFERENCES public.registros_acceso(id) ON DELETE CASCADE,
    vehiculo_id INT REFERENCES public.vehiculos(id) ON DELETE CASCADE,
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    hora_asignacion TIMESTAMPTZ DEFAULT NOW(),
    hora_liberacion TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Vigente' -- Vigente, Finalizada
);

-- Tabla RESERVAS_BLOQUEOS (Jefatura)
CREATE TABLE public.reservas_bloqueos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    espacio_id VARCHAR(10) REFERENCES public.espacios(id) ON DELETE CASCADE,
    jefe_id UUID REFERENCES public.usuarios(id),
    motivo TEXT,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    estado VARCHAR(20) DEFAULT 'Activo' -- Activo, Expirado, Cancelado
);

-- Tabla INCIDENTES (Doble fila, bloqueos)
CREATE TABLE public.incidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reportador_id UUID REFERENCES public.usuarios(id),
    vehiculo_bloqueador_id INT REFERENCES public.vehiculos(id),
    espacio_id VARCHAR(10) REFERENCES public.espacios(id),
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Pendiente', -- Pendiente, En_Revision, Resuelto
    fecha_reporte TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocupaciones_fisicas ENABLE ROW LEVEL SECURITY;

-- Política Usuarios: Los usuarios solo pueden ver/editar su propio registro (a menos que sean admins, lo cual requeriría otra política)
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

-- Política Vehiculos: Conductores solo ven sus vehículos
CREATE POLICY "Conductores ven sus propios vehículos" ON public.vehiculos
    FOR SELECT USING (auth.uid() = usuario_id);

-- 4. POBLAR DATOS BÁSICOS
INSERT INTO public.roles (id, nombre) VALUES (1, 'CONDUCTOR'), (2, 'GUARDIA'), (3, 'JEFATURA'), (4, 'SUPERADMIN');
INSERT INTO public.espacios (id, tipo, estado) VALUES ('A-01', 'PMR', 'Libre'), ('A-02', 'PMR', 'Libre'), ('A-03', 'Normal', 'Libre');
