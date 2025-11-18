# Sistema de Gestión de Donaciones

Sistema web para la gestión de puntos de donación desarrollado como proyecto de tesis.

## Descripción

Sistema que permite gestionar puntos de donación, facilitando la conexión entre donantes y organizaciones que reciben donaciones. Incluye funcionalidades para administradores, organizaciones y donantes.

## Tecnologías Utilizadas

### Backend
- Java 17
- Spring Boot 3.x
- Spring Data JPA
- MySQL
- Maven

### Frontend
- React 18
- TypeScript
- Vite
- Leaflet (mapas)
- Axios

## Estructura del Proyecto

```
donaciones-app/
├── backend/              # Backend Spring Boot
│   └── donaciones-backend/
│       └── donaciones-backend/
│           └── src/
│               └── main/
│                   ├── java/    # Código fuente Java
│                   └── resources/
│                       └── application.properties
│
└── frontend/           # Frontend React
    └── src/
        ├── components/  # Componentes React
        ├── config/     # Configuración
        └── App.tsx
```

## Requisitos

- Java 17 o superior
- Node.js 18 o superior
- MySQL 8.0 o superior
- Maven 3.6 o superior

## Configuración

### Base de Datos

1. Crear la base de datos MySQL:
```sql
CREATE DATABASE donaciones_db;
```

2. Configurar las credenciales en `backend/donaciones-backend/donaciones-backend/src/main/resources/application.properties`

### Backend

1. Navegar a la carpeta del backend:
```bash
cd backend/donaciones-backend/donaciones-backend
```

2. Ejecutar la aplicación:
```bash
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### Frontend

1. Navegar a la carpeta del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar en modo desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Funcionalidades

### Administrador
- Gestión completa de puntos de donación
- Aprobación/rechazo de puntos creados por organizaciones
- Visualización de todos los puntos (activos e inactivos)

### Organización
- Crear puntos de donación (requieren aprobación)
- Gestionar sus propios puntos
- Ver estado de aprobación de sus puntos

### Donante
- Visualizar mapa de puntos de donación
- Agregar puntos a favoritos
- Agendar visitas a puntos de donación

## Licencia

Este proyecto fue desarrollado como parte de una tesis de ingeniería.

