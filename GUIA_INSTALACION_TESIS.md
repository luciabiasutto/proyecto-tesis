# Guía De Instalación y Ejecución del Sistema

## Código Fuente

El código completo del proyecto se encuentra disponible en el siguiente repositorio de GitHub: 
**https://github.com/luciabiasutto/proyecto-tesis**


## Requisitos Previos

Instalar estas herramientas antes de comenzar:

### 1. Java 17 o superior
- Descargar desde: https://www.oracle.com/java/technologies/downloads/

### 2. Node.js 18 o superior
- Descargar desde: https://nodejs.org/

### 3. MySQL 8.0 o superior (o XAMPP que incluye MySQL)
- XAMPP: https://www.apachefriends.org/
- MySQL standalone: https://dev.mysql.com/downloads/mysql/

### 4. Maven 3.6 o superior
- Descargar desde: https://maven.apache.org/download.cgi


## Configurar la Base de Datos

1. Iniciar MySQL (desde XAMPP o como servicio)

2. Crear la base de datos ejecutando este comando SQL:
   ```sql
   CREATE DATABASE donaciones_db;
   ```

3. Verificar que MySQL tenga:
   - Usuario: `root`
   - Contraseña: `1234`
   
   Si tu contraseña es diferente, cambia la configuración en el archivo `application.properties`.


## Ejecutar el Backend

1. Abrir una terminal y navegar a la carpeta del backend:
   ```bash
   cd backend/donaciones-backend/donaciones-backend
   ```

2. Verificar el archivo `application.properties`:
   - Debe tener: `usuario=root`, `contraseña=1234`
   - Si la contraseña es diferente, cámbiala aquí.

3. Ejecutar el backend:
   ```bash
   mvn spring-boot:run
   ```
   
   O si no funciona, usar:
   ```bash
   .\mvnw.cmd spring-boot:run  (Windows)
   ./mvnw spring-boot:run      (Mac/Linux)
   ```

4. Esperar a ver el mensaje: **"Started DonacionesBackendApplication"**
   
   Esto significa que el backend está corriendo en `http://localhost:8080`

5. **Dejar esta terminal abierta** (el backend debe seguir corriendo).


## Ejecutar el Frontend

1. Abrir una **nueva terminal** 

2. Navegar a la carpeta del frontend:
   ```bash
   cd frontend
   ```

3. Instalar las dependencias:
   ```bash
   npm install
   ```

4. Ejecutar el frontend:
   ```bash
   npm run dev
   ```

5. Esperar a ver el mensaje con la URL: **http://localhost:5173/**
   
   Esto significa que el frontend está corriendo.

6. **Dejar esta terminal abierta también.**


## Abrir la Aplicación

1. Abrir navegador web

2. Ir a: **http://localhost:5173**

3. Se debería ver la pantalla de login del sistema.


## Crear una Cuenta

### Opción 1: Desde la Interfaz
- Haz clic en "Crear cuenta" o "Registrarse"
- Completa el formulario y selecciona el tipo de usuario
- Haz clic en "Registrarse"

### Opción 2: Crear Administrador desde la Base de Datos
- Abrir MySQL y ejecutar:
  ```sql
  USE donaciones_db;
  INSERT INTO administrador (nombre, apellido, email, password, fecha_registro, activo, rol)
  VALUES ('Admin', 'Sistema', 'admin@test.com', 'admin123', NOW(), true, 'ADMINISTRADOR');
  ```
  
- Luego iniciar sesión con:
  - **Email:** admin@test.com
  - **Contraseña:** admin123
  - **Rol:** Administrador


## Verificar que Todo Funciona

### Backend funcionando:
- Terminal muestra: "Started DonacionesBackendApplication"
- Acceder a: http://localhost:8080/api/health

### Frontend funcionando:
- Terminal muestra: "Local: http://localhost:5173/"
- Abrir http://localhost:5173 en el navegador

### Base de datos funcionando:
- MySQL está corriendo
- La base de datos `donaciones_db` existe
- El backend se conecta sin errores