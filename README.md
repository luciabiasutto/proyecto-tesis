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
- MySQL 8.0 o superior (o XAMPP que incluye MySQL)
- Maven 3.6 o superior

## Instalación y Ejecución

**📖 Para instrucciones detalladas paso a paso, consulta el archivo [INSTALACION.md](INSTALACION.md)**

### Resumen Rápido

1. **Instalar requisitos previos** (Java, Node.js, MySQL, Maven)

2. **Configurar la base de datos:**
   ```sql
   CREATE DATABASE donaciones_db;
   ```

3. **Ejecutar el backend:**
   ```bash
   cd backend/donaciones-backend/donaciones-backend
   mvn spring-boot:run
   ```
   El backend estará disponible en `http://localhost:8080`

4. **Ejecutar el frontend** (en una nueva terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   El frontend estará disponible en `http://localhost:5173`

5. **Abrir el navegador** en `http://localhost:5173`

**⚠️ IMPORTANTE:** Consulta [INSTALACION.md](INSTALACION.md) para instrucciones completas, solución de problemas y configuración detallada.

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

