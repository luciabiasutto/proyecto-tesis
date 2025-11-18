-- Script para actualizar la base de datos con el nuevo rol ORGANIZACION
-- y los campos necesarios para el sistema de aprobación

-- 1. Actualizar la tabla puntos_donacion para agregar campos de estado y creador
ALTER TABLE puntos_donacion 
ADD COLUMN estado VARCHAR(20) DEFAULT 'ACTIVO',
ADD COLUMN usuario_creador_id BIGINT NULL,
ADD COLUMN tipo_creador VARCHAR(50) NULL,
ADD COLUMN motivo_rechazo TEXT NULL;

-- 2. Actualizar puntos existentes para que tengan estado ACTIVO
UPDATE puntos_donacion SET estado = 'ACTIVO' WHERE estado IS NULL;

-- 3. Crear la tabla organizaciones
CREATE TABLE IF NOT EXISTS organizaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'ORGANIZACION',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear índice para búsquedas por email
CREATE INDEX idx_organizaciones_email ON organizaciones(email);

-- 5. Actualizar puntos existentes para que sean compatibles
-- (Los puntos creados antes no tienen creador, así que quedan NULL)
UPDATE puntos_donacion SET estado = 'ACTIVO' WHERE estado IS NULL;







