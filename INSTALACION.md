# Guía de Instalación y Ejecución del Sistema

Esta guía explica paso a paso cómo instalar y ejecutar el Sistema de Gestión de Donaciones en tu computadora.

---

## 📋 Requisitos Previos

Antes de comenzar, necesitas instalar las siguientes herramientas:

### 1. Java 17 o superior
- **Descargar:** https://www.oracle.com/java/technologies/downloads/#java17
- **Verificar instalación:** Abre una terminal y ejecuta:
  ```bash
  java -version
  ```
  Debe mostrar la versión 17 o superior.

### 2. Node.js 18 o superior
- **Descargar:** https://nodejs.org/
- **Verificar instalación:** Abre una terminal y ejecuta:
  ```bash
  node -v
  npm -v
  ```
  Debe mostrar la versión 18 o superior para Node.js.

### 3. MySQL 8.0 o superior
- **Opción A (Recomendada):** XAMPP (incluye MySQL)
  - **Descargar:** https://www.apachefriends.org/
  - Instala XAMPP y asegúrate de que MySQL esté corriendo
  
- **Opción B:** MySQL Server standalone
  - **Descargar:** https://dev.mysql.com/downloads/mysql/

- **Verificar instalación:** Abre una terminal y ejecuta:
  ```bash
  mysql --version
  ```

### 4. Maven 3.6 o superior
- **Descargar:** https://maven.apache.org/download.cgi
- **Verificar instalación:** Abre una terminal y ejecuta:
  ```bash
  mvn -v
  ```

---

## 🗄️ Paso 1: Configurar la Base de Datos

### 1.1. Iniciar MySQL

**Si usas XAMPP:**
1. Abre el Panel de Control de XAMPP
2. Haz clic en "Start" junto a MySQL
3. Espera a que el indicador se ponga verde

**Si usas MySQL standalone:**
- Asegúrate de que el servicio MySQL esté corriendo

### 1.2. Crear la Base de Datos

1. Abre MySQL Workbench, phpMyAdmin, o la línea de comandos de MySQL
2. Ejecuta el siguiente comando SQL:

```sql
CREATE DATABASE donaciones_db;
```

**O usando la línea de comandos:**
```bash
mysql -u root -p
```
Luego ejecuta:
```sql
CREATE DATABASE donaciones_db;
EXIT;
```

### 1.3. Verificar la Contraseña de MySQL

El sistema está configurado para usar:
- **Usuario:** `root`
- **Contraseña:** `1234`

Si tu MySQL tiene una contraseña diferente, tendrás que cambiarla o actualizar la configuración (ver Paso 2.2).

**Para cambiar la contraseña a "1234" (si es necesario):**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '1234';
FLUSH PRIVILEGES;
```

---

## ⚙️ Paso 2: Configurar el Backend

### 2.1. Navegar a la Carpeta del Backend

Abre una terminal (PowerShell en Windows, Terminal en Mac/Linux) y ejecuta:

```bash
cd "ruta/donde/descargaste/el/proyecto/donaciones-app/backend/donaciones-backend/donaciones-backend"
```

**Ejemplo en Windows:**
```powershell
cd "C:\Users\TuUsuario\Descargas\proyecto-tesis-main\backend\donaciones-backend\donaciones-backend"
```

### 2.2. Verificar/Configurar application.properties

Abre el archivo:
```
src/main/resources/application.properties
```

Verifica que tenga estas configuraciones:

```properties
# Base de datos
spring.datasource.url=jdbc:mysql://localhost:3306/donaciones_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=1234

# Puerto del servidor
server.port=8080
server.servlet.context-path=/api
```

**Si tu contraseña de MySQL es diferente a "1234":**
- Cambia `spring.datasource.password=1234` por tu contraseña

### 2.3. Instalar Dependencias (Maven descargará automáticamente)

No necesitas instalar nada manualmente. Maven descargará todas las dependencias automáticamente cuando ejecutes el proyecto.

### 2.4. Ejecutar el Backend

En la terminal, ejecuta:

```bash
mvn spring-boot:run
```

**O si tienes problemas con Maven, puedes usar el wrapper incluido:**
```bash
# En Windows:
.\mvnw.cmd spring-boot:run

# En Mac/Linux:
./mvnw spring-boot:run
```

**Espera a que veas este mensaje:**
```
Started DonacionesBackendApplication in X.XXX seconds
```

Esto significa que el backend está corriendo en `http://localhost:8080`

**⚠️ IMPORTANTE:** Deja esta terminal abierta. El backend debe seguir corriendo.

---

## 🎨 Paso 3: Configurar el Frontend

### 3.1. Abrir una Nueva Terminal

Abre una **nueva terminal** (deja la del backend abierta) y navega a la carpeta del frontend:

```bash
cd "ruta/donde/descargaste/el/proyecto/donaciones-app/frontend"
```

**Ejemplo en Windows:**
```powershell
cd "C:\Users\TuUsuario\Descargas\proyecto-tesis-main\frontend"
```

### 3.2. Instalar Dependencias

Ejecuta:

```bash
npm install
```

Esto descargará todas las dependencias de Node.js. Puede tardar varios minutos la primera vez.

**Espera a que termine** (verás un mensaje como "added XXX packages").

### 3.3. Ejecutar el Frontend

Ejecuta:

```bash
npm run dev
```

**Espera a que veas este mensaje:**
```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Esto significa que el frontend está corriendo en `http://localhost:5173`

**⚠️ IMPORTANTE:** Deja esta terminal abierta también.

---

## 🚀 Paso 4: Abrir la Aplicación

1. Abre tu navegador web (Chrome, Firefox, Edge, etc.)
2. Ve a: **http://localhost:5173**
3. Deberías ver la pantalla de login del sistema

---

## 👤 Paso 5: Crear una Cuenta de Prueba

### Opción 1: Crear desde la Interfaz

1. En la pantalla de login, haz clic en "Crear cuenta" o "Registrarse"
2. Completa el formulario:
   - Selecciona el tipo de usuario (Donante, Administrador, o Organización)
   - Completa todos los campos
   - Haz clic en "Registrarse"

### Opción 2: Crear desde la Base de Datos (Solo para Administrador)

Si necesitas crear un administrador directamente en la base de datos:

```sql
USE donaciones_db;

INSERT INTO administrador (nombre, apellido, email, password, fecha_registro, activo, rol)
VALUES ('Admin', 'Sistema', 'admin@test.com', 'admin123', NOW(), true, 'ADMINISTRADOR');
```

Luego puedes iniciar sesión con:
- **Email:** admin@test.com
- **Contraseña:** admin123
- **Rol:** Administrador

---

## ✅ Verificar que Todo Funciona

### Backend funcionando:
- ✅ Terminal del backend muestra: "Started DonacionesBackendApplication"
- ✅ Puedes acceder a: http://localhost:8080/api/health (debería responder)

### Frontend funcionando:
- ✅ Terminal del frontend muestra: "Local: http://localhost:5173/"
- ✅ Puedes abrir http://localhost:5173 en el navegador

### Base de datos funcionando:
- ✅ MySQL está corriendo
- ✅ La base de datos `donaciones_db` existe
- ✅ El backend se conecta sin errores

---

## 🛠️ Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"

**Solución:**
1. Verifica que MySQL esté corriendo (XAMPP o servicio MySQL)
2. Verifica que la contraseña en `application.properties` sea correcta
3. Verifica que la base de datos `donaciones_db` exista

### Error: "Port 8080 already in use"

**Solución:**
1. Cierra otras aplicaciones que usen el puerto 8080
2. O cambia el puerto en `application.properties`:
   ```properties
   server.port=8081
   ```
3. Luego actualiza el frontend en `vite.config.ts`:
   ```typescript
   target: 'http://localhost:8081'
   ```

### Error: "Port 5173 already in use"

**Solución:**
1. Cierra otras aplicaciones que usen el puerto 5173
2. O ejecuta el frontend en otro puerto:
   ```bash
   npm run dev -- --port 5174
   ```

### Error: "npm install" falla

**Solución:**
1. Verifica que Node.js esté instalado: `node -v`
2. Limpia la caché: `npm cache clean --force`
3. Elimina `node_modules` y `package-lock.json`, luego ejecuta `npm install` de nuevo

### Error: "mvn spring-boot:run" falla

**Solución:**
1. Verifica que Maven esté instalado: `mvn -v`
2. Verifica que Java esté instalado: `java -version`
3. Usa el wrapper incluido: `.\mvnw.cmd spring-boot:run` (Windows) o `./mvnw spring-boot:run` (Mac/Linux)

### La aplicación no se conecta al backend

**Solución:**
1. Verifica que el backend esté corriendo (terminal del backend)
2. Verifica que el backend esté en el puerto 8080
3. Abre las herramientas de desarrollador del navegador (F12) y revisa la consola para ver errores

---

## 📝 Notas Importantes

1. **Dos terminales abiertas:** Necesitas mantener abiertas DOS terminales:
   - Una para el backend (mvn spring-boot:run)
   - Una para el frontend (npm run dev)

2. **Orden de inicio:** Siempre inicia primero el backend, luego el frontend

3. **Base de datos:** La primera vez que ejecutes el backend, Spring Boot creará automáticamente las tablas en la base de datos (gracias a `spring.jpa.hibernate.ddl-auto=update`)

4. **Cerrar la aplicación:** Para detener la aplicación:
   - Presiona `Ctrl + C` en ambas terminales
   - Cierra MySQL si no lo necesitas

---

## 🎓 Para los Evaluadores

Si estás revisando este código como evaluador:

1. **Extrae el ZIP** del proyecto
2. **Sigue los pasos de esta guía** en orden
3. **Si encuentras problemas**, revisa la sección "Solución de Problemas Comunes"
4. **Para probar el sistema**, crea una cuenta desde la interfaz o usa el administrador de prueba mencionado arriba

El sistema está diseñado para funcionar completamente con estas instrucciones. No se requieren configuraciones adicionales más allá de las mencionadas.

---

## 📞 Soporte

Si tienes problemas que no se resuelven con esta guía:
1. Revisa los logs en las terminales (backend y frontend)
2. Revisa los logs de MySQL
3. Verifica que todas las versiones de las herramientas sean compatibles (ver "Requisitos Previos")

---

**¡Listo! El sistema debería estar funcionando correctamente.** 🎉

