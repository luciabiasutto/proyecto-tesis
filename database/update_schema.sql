-- Actualizar esquema para incluir tablas de donaciones y beneficiarios

-- Crear tabla beneficiarios
CREATE TABLE IF NOT EXISTS beneficiarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    documento VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Actualizar tabla donaciones para incluir nuevas columnas
ALTER TABLE donaciones 
ADD COLUMN IF NOT EXISTS beneficiario_id BIGINT,
ADD COLUMN IF NOT EXISTS fecha_entrega DATETIME,
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Agregar foreign key para beneficiario_id
ALTER TABLE donaciones 
ADD CONSTRAINT IF NOT EXISTS fk_donaciones_beneficiario 
FOREIGN KEY (beneficiario_id) REFERENCES beneficiarios(id);

-- Insertar datos de ejemplo para beneficiarios
INSERT INTO beneficiarios (nombre, apellido, documento, telefono, email, direccion) VALUES
('María', 'González', '12345678', '0351-111-1111', 'maria.gonzalez@email.com', 'Av. Colón 100, Córdoba'),
('Juan', 'Pérez', '87654321', '0351-222-2222', 'juan.perez@email.com', 'San Martín 200, Córdoba'),
('Ana', 'López', '11223344', '0351-333-3333', 'ana.lopez@email.com', 'Belgrano 300, Córdoba');

-- Insertar datos de ejemplo para donaciones
INSERT INTO donaciones (punto_donacion_id, tipo_donacion, cantidad, descripcion, estado, fecha_donacion, beneficiario_id) VALUES
(1, 'ropa', 5, 'Ropa de invierno en buen estado', 'RECIBIDA', '2025-09-25 10:00:00', 1),
(2, 'vidrio', 10, 'Botellas de vidrio para reciclaje', 'CLASIFICADA', '2025-09-25 11:00:00', 2),
(3, 'plastico', 15, 'Envases de plástico limpios', 'DISTRIBUIDA', '2025-09-25 12:00:00', 3),
(1, 'ropa', 3, 'Ropa de verano', 'ENTREGADA', '2025-09-24 15:00:00', 1),
(2, 'vidrio', 8, 'Frascos de vidrio', 'ENTREGADA', '2025-09-24 16:00:00', 2);
