-- Script para actualizar la base de datos con el sistema de roles

-- Crear tabla donantes
CREATE TABLE IF NOT EXISTS donantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion TEXT NOT NULL,
    rol ENUM('DONANTE', 'ADMINISTRADOR') NOT NULL DEFAULT 'DONANTE',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla administradores
CREATE TABLE IF NOT EXISTS administradores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    rol ENUM('DONANTE', 'ADMINISTRADOR') NOT NULL DEFAULT 'ADMINISTRADOR',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actualizar tabla donaciones para incluir donante_id
ALTER TABLE donaciones 
ADD COLUMN IF NOT EXISTS donante_id BIGINT;

-- Insertar datos de ejemplo para donantes
INSERT INTO donantes (nombre, apellido, email, password, telefono, direccion) VALUES
('Carlos', 'García', 'carlos.garcia@email.com', '123456', '0351-444-4444', 'Av. Colón 500, Córdoba'),
('Laura', 'Martínez', 'laura.martinez@email.com', '123456', '0351-555-5555', 'San Martín 600, Córdoba'),
('Roberto', 'Fernández', 'roberto.fernandez@email.com', '123456', '0351-666-6666', 'Belgrano 700, Córdoba');

-- Insertar datos de ejemplo para administradores
INSERT INTO administradores (nombre, apellido, email, password, telefono) VALUES
('Admin', 'Sistema', 'admin@donaciones.com', 'admin123', '0351-000-0000'),
('María', 'Admin', 'maria.admin@donaciones.com', 'admin123', '0351-111-0000');
