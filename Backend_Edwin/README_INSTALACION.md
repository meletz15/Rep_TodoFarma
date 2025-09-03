# 🚀 Guía de Instalación - API REST de Usuarios

Esta guía te ayudará a configurar y ejecutar el backend de la API REST de usuarios tanto con Docker como con una base de datos PostgreSQL local.

## 📋 Requisitos Previos

### Para Docker:
- Docker Desktop o Docker Engine
- Docker Compose
- Node.js 18+ (para desarrollo local)

### Para PostgreSQL Local:
- Node.js 18+
- PostgreSQL 16+ instalado localmente
- npm o yarn

## 🐳 Opción 1: Instalación con Docker (Recomendado)

### Paso 1: Clonar y configurar el proyecto

```bash
# Clonar el repositorio (si no lo tienes)
git clone <url-del-repositorio>
cd api-rest-usuarios

# Crear archivo de variables de entorno
cp env.example .env
```

### Paso 2: Configurar variables de entorno

Editar el archivo `.env` con los siguientes valores:

```env
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_NAME=mi_basedatos
DB_USER=mi_usuario
DB_PASSWORD=mi_password
JWT_SECRET=super_secreto_cambiar
JWT_EXPIRES_IN=1d
BORRADO_FISICO=false
```

### Paso 3: Levantar con Docker Compose

```bash
# Levantar la base de datos
docker-compose up -d

# Verificar que la base de datos esté funcionando
docker-compose ps
```

### Paso 4: Instalar dependencias y ejecutar la aplicación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Paso 5: Verificar la instalación

```bash
# Health check
curl http://localhost:3000/health

# Probar login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "admin@dominio.com", "contrasena": "Admin123!"}'
```

## 🖥️ Opción 2: Instalación con PostgreSQL Local

### Paso 1: Verificar PostgreSQL instalado

```bash
# Verificar si PostgreSQL está instalado
psql --version

# Si no está instalado, instalarlo:
# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL:
sudo yum install postgresql postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Paso 2: Configurar PostgreSQL

```bash
# Acceder como usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE mi_basedatos;
CREATE USER mi_usuario WITH PASSWORD 'mi_password';
GRANT ALL PRIVILEGES ON DATABASE mi_basedatos TO mi_usuario;
\q
```

### Paso 3: Configurar el proyecto

```bash
# Crear archivo de variables de entorno
cp env.example .env
```

### Paso 4: Modificar variables de entorno para PostgreSQL local

Editar el archivo `.env` con los siguientes valores:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mi_basedatos
DB_USER=mi_usuario
DB_PASSWORD=mi_password
JWT_SECRET=super_secreto_cambiar
JWT_EXPIRES_IN=1d
BORRADO_FISICO=false
```

### Paso 5: Ejecutar scripts de base de datos

```bash
# Ejecutar script de inicialización
psql -U mi_usuario -d mi_basedatos -f scripts/init.sql

# Ejecutar script de datos iniciales
psql -U mi_usuario -d mi_basedatos -f scripts/seed.sql
```

### Paso 6: Instalar dependencias y ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## 🔧 Configuración Avanzada

### Cambiar puerto de PostgreSQL

Si PostgreSQL ya está usando el puerto 5432, puedes:

#### Opción A: Cambiar puerto en Docker

Editar `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Cambiar 5433 por el puerto deseado
```

Y actualizar `.env`:
```env
DB_PORT=5433
```

#### Opción B: Cambiar puerto de PostgreSQL local

Editar `/etc/postgresql/[version]/main/postgresql.conf`:
```
port = 5433
```

Reiniciar PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Configurar SSL para PostgreSQL

Si necesitas SSL, agregar en `src/config/db.js`:

```javascript
const pool = new Pool({
  // ... configuración existente
  ssl: {
    rejectUnauthorized: false
  }
});
```

## 🚨 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Verificar qué está usando el puerto
sudo lsof -i :5432
sudo lsof -i :3000

# Detener servicios conflictivos
sudo systemctl stop postgresql  # Para PostgreSQL local
```

### Error: Conexión rechazada

```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar configuración de red en pg_hba.conf
sudo nano /etc/postgresql/[version]/main/pg_hba.conf
```

### Error: Permisos de base de datos

```bash
# Conectar como postgres y verificar permisos
sudo -u postgres psql
\l  # Listar bases de datos
\du # Listar usuarios
```

## 📊 Verificación de la Instalación

### Endpoints de prueba

```bash
# 1. Health Check
curl http://localhost:3000/health

# 2. Login de administrador
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo": "admin@dominio.com", "contrasena": "Admin123!"}'

# 3. Obtener usuarios (con token del login anterior)
curl -H "Authorization: Bearer <TOKEN>" \
  http://localhost:3000/api/usuarios
```

### Respuestas esperadas

**Health Check:**
```json
{
  "ok": true,
  "mensaje": "API funcionando correctamente",
  "timestamp": "2025-08-29T03:51:29.377Z",
  "version": "1.0.0"
}
```

**Login exitoso:**
```json
{
  "ok": true,
  "mensaje": "Inicio de sesión exitoso",
  "datos": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usuario": 1,
      "nombre": "Admin",
      "apellido": "Sistema",
      "correo": "admin@dominio.com",
      "rol": "ADMIN"
    }
  }
}
```

## 🛠️ Comandos Útiles

### Docker

```bash
# Ver logs de la base de datos
docker-compose logs db

# Acceder a la base de datos
docker-compose exec db psql -U mi_usuario -d mi_basedatos

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache
```

### Desarrollo

```bash
# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Linting
npm run lint

# Formateo de código
npm run format
```

### Base de datos local

```bash
# Conectar a PostgreSQL
psql -U mi_usuario -d mi_basedatos

# Verificar tablas
\dt

# Verificar datos
SELECT * FROM usuarios;
SELECT * FROM roles;
```

## 📁 Estructura de Archivos Importantes

```
├── .env                    # Variables de entorno
├── docker-compose.yml      # Configuración de Docker
├── package.json           # Dependencias de Node.js
├── scripts/
│   ├── init.sql          # Script de inicialización de BD
│   └── seed.sql          # Datos iniciales
└── src/
    ├── config/
    │   ├── db.js         # Configuración de base de datos
    │   └── env.js        # Variables de entorno
    └── server.js         # Punto de entrada
```

## 🔐 Usuario por Defecto

Al instalar el proyecto se crea automáticamente un usuario administrador:

- **Correo:** `admin@dominio.com`
- **Contraseña:** `Admin123!`
- **Rol:** `ADMIN`

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Verificar que todos los requisitos estén instalados
2. Revisar los logs de la aplicación
3. Verificar la conectividad de la base de datos
4. Consultar la documentación completa en `README.md`

## 🎯 Próximos Pasos

Una vez que el backend esté funcionando:

1. Configurar el frontend (si aplica)
2. Revisar la documentación de la API
3. Configurar variables de entorno para producción
4. Implementar medidas de seguridad adicionales

## 🚀 Instalación Automatizada (Recomendado)

Para facilitar la instalación, hemos creado scripts automatizados que detectan automáticamente tu entorno y configuran todo por ti.

### Instalación Automatizada Completa

```bash
# Hacer el script ejecutable
chmod +x scripts/install.sh

# Ejecutar instalación automatizada
./scripts/install.sh
```

Este script:
- Detecta automáticamente si PostgreSQL está instalado
- Detecta si Docker está disponible
- Configura las variables de entorno apropiadas
- Instala dependencias
- Ejecuta scripts de base de datos
- Verifica que todo funcione correctamente

### Configuración Rápida de Entorno

Si ya tienes el proyecto configurado y solo quieres cambiar entre Docker y PostgreSQL local:

```bash
# Hacer el script ejecutable
chmod +x scripts/setup-env.sh

# Configurar para Docker
./scripts/setup-env.sh docker

# Configurar para PostgreSQL local
./scripts/setup-env.sh local
```

### Archivos de Configuración Predefinidos

También hemos creado archivos de configuración predefinidos:

- `env.docker` - Configuración para Docker
- `env.local` - Configuración para PostgreSQL local
- `env.example` - Plantilla base

Para usar estos archivos:

```bash
# Para Docker
cp env.docker .env

# Para PostgreSQL local
cp env.local .env
```

## 🔄 Cambio Rápido de Configuración

Si necesitas cambiar rápidamente entre configuraciones:

```bash
# Interactivo
./scripts/setup-env.sh

# Directo
./scripts/setup-env.sh docker    # Para Docker
./scripts/setup-env.sh local     # Para PostgreSQL local
```

Estos scripts verifican automáticamente que los servicios necesarios estén disponibles y te guían a través del proceso de configuración.
