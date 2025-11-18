-- Script para arreglar la tabla puntos_donacion
-- Ejecutar en phpMyAdmin

-- Agregar columna password si no existe
ALTER TABLE puntos_donacion 
ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT '123456';

-- Agregar columna rol si no existe  
ALTER TABLE puntos_donacion 
ADD COLUMN IF NOT EXISTS rol VARCHAR(50) DEFAULT 'PUNTO_DONACION';

-- Actualizar registros existentes con valores por defecto
UPDATE puntos_donacion 
SET password = '123456' 
WHERE password IS NULL;

UPDATE puntos_donacion 
SET rol = 'PUNTO_DONACION' 
WHERE rol IS NULL;

