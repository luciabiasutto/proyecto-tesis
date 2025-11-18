-- Tabla de puntos de donación
CREATE TABLE puntos_donacion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    tipo_donacion ENUM('ropa', 'vidrio', 'plastico', 'papel', 'organicos', 'otros') NOT NULL,
    horario_apertura TIME,
    horario_cierre TIME,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de donaciones
CREATE TABLE donaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    punto_donacion_id INT,
    donante_nombre VARCHAR(255) NOT NULL,
    donante_email VARCHAR(255),
    donante_telefono VARCHAR(20),
    tipo_donacion ENUM('ropa', 'vidrio', 'plastico', 'papel', 'organicos', 'otros') NOT NULL,
    descripcion TEXT,
    cantidad INT DEFAULT 1,
    estado ENUM('recibida', 'clasificada', 'distribuida', 'entregada') DEFAULT 'recibida',
    fecha_donacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NULL,
    beneficiario_nombre VARCHAR(255),
    beneficiario_contacto VARCHAR(255),
    FOREIGN KEY (punto_donacion_id) REFERENCES puntos_donacion(id)
);

-- Insertar datos de ejemplo
INSERT INTO puntos_donacion (nombre, direccion, latitud, longitud, tipo_donacion, horario_apertura, horario_cierre, telefono) VALUES
('Centro de Donaciones Centro', 'Av. Principal 123, Centro', -12.0464, -77.0428, 'ropa', '08:00:00', '18:00:00', '01-234-5678'),
('Punto Verde Miraflores', 'Av. Larco 456, Miraflores', -12.1201, -77.0340, 'vidrio', '09:00:00', '17:00:00', '01-234-5679'),
('Reciclaje San Isidro', 'Av. Javier Prado 789, San Isidro', -12.0989, -77.0335, 'plastico', '07:00:00', '19:00:00', '01-234-5680');