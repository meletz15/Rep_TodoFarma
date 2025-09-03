# API REST de Usuarios

API REST completa desarrollada con Node.js, Express.js y PostgreSQL que incluye autenticación JWT, CRUD de usuarios, reportes y Docker.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **CRUD completo de usuarios** con validaciones
- **Sistema de roles** (ADMIN, EMPLEADO, INVITADO)
- **Reportes y estadísticas** de usuarios
- **Paginación y filtros** avanzados
- **Validación de entrada** con Joi
- **Seguridad** con bcrypt, helmet, CORS
- **Docker** con docker-compose
- **Logging** con Morgan
- **Manejo de errores** centralizado

## 📋 Requisitos Previos

- Node.js 18+ o Docker
- PostgreSQL 16+ (si no usas Docker)
- npm o yarn

## 🛠️ Instalación

### Opción 1: Con Docker (Recomendado)

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd api-rest-usuarios
```

2. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus valores
```

3. **Levantar con Docker Compose**
```bash
docker-compose up -d
```

4. **Verificar que todo funcione**
```bash
curl http://localhost:3000/health
```

### Opción 2: Instalación Local

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar base de datos PostgreSQL**
```bash
# Crear base de datos y ejecutar scripts
psql -U postgres -d mi_basedatos -f scripts/init.sql
psql -U postgres -d mi_basedatos -f scripts/seed.sql
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus valores
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🔧 Variables de Entorno

Crear archivo `.env` basado en `env.example`:

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

## 📚 Endpoints de la API

### Autenticación

#### POST /api/auth/login
Iniciar sesión de usuario.

**Body:**
```json
{
  "correo": "admin@dominio.com",
  "contrasena": "Admin123!"
}
```

**Respuesta:**
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

#### GET /api/auth/perfil
Obtener perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

#### POST /api/auth/cambiar-contrasena
Cambiar contraseña del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contrasena_actual": "Admin123!",
  "contrasena_nueva": "NuevaContrasena123!"
}
```

### Usuarios (Requiere autenticación)

#### POST /api/usuarios
Crear nuevo usuario (solo ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@ejemplo.com",
  "contrasena": "Contrasena123!",
  "rol_id": 2,
  "estado": "ACTIVO"
}
```

#### GET /api/usuarios
Obtener usuarios con paginación y filtros (solo ADMIN).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `pagina`: Número de página (default: 1)
- `limite`: Elementos por página (default: 10, max: 100)
- `rol_id`: Filtrar por rol
- `estado`: Filtrar por estado (ACTIVO/INACTIVO)
- `busqueda`: Búsqueda en nombre, apellido o correo

**Ejemplo:** `GET /api/usuarios?pagina=1&limite=5&estado=ACTIVO`

#### GET /api/usuarios/:id_usuario
Obtener usuario por ID (ADMIN o propio usuario).

#### PUT /api/usuarios/:id_usuario
Actualizar usuario (ADMIN o propio usuario con restricciones).

#### DELETE /api/usuarios/:id_usuario
Eliminar usuario (solo ADMIN, eliminación lógica por defecto).

#### POST /api/usuarios/:id_usuario/cambiar-contrasena
Cambiar contraseña de usuario específico (solo ADMIN).

### Reportes (Requiere rol ADMIN)

#### GET /api/reportes/usuarios/activos
Reporte de usuarios activos con paginación.

#### GET /api/reportes/usuarios/inactivos
Reporte de usuarios inactivos con paginación.

#### GET /api/reportes/usuarios/por-fecha
Reporte de usuarios por rango de fechas.

**Query Parameters:**
- `desde`: Fecha inicio (YYYY-MM-DD)
- `hasta`: Fecha fin (YYYY-MM-DD)

**Ejemplo:** `GET /api/reportes/usuarios/por-fecha?desde=2024-01-01&hasta=2024-12-31`

#### GET /api/reportes/estadisticas
Estadísticas generales del sistema.

## 🔐 Autenticación y Autorización

### Roles del Sistema

1. **ADMIN**: Acceso completo a todas las funcionalidades
2. **EMPLEADO**: Acceso limitado, puede ver y editar sus propios datos
3. **INVITADO**: Acceso mínimo, solo lectura de sus propios datos

### Uso de Tokens

Incluir el token JWT en el header `Authorization`:
```
Authorization: Bearer <token>
```

### Usuario por Defecto

Al iniciar la aplicación se crea automáticamente un usuario admin:
- **Correo:** admin@dominio.com
- **Contraseña:** Admin123!

## 📊 Estructura de Respuestas

Todas las respuestas siguen el formato:

```json
{
  "ok": boolean,
  "mensaje": "string",
  "datos": any,
  "errores": any
}
```

### Códigos de Estado HTTP

- `200`: Operación exitosa
- `201`: Recurso creado
- `400`: Error de validación
- `401`: No autenticado
- `403`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## 🐳 Docker

### Comandos Útiles

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache

# Acceder a la base de datos
docker-compose exec db psql -U mi_usuario -d mi_basedatos
```

### Volúmenes

- `pgdata`: Datos persistentes de PostgreSQL
- `./scripts/`: Scripts SQL montados en el contenedor

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### Ejemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@dominio.com",
    "contrasena": "Admin123!"
  }'
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── config/
│   │   ├── db.js          # Configuración de base de datos
│   │   └── env.js         # Variables de entorno
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── usuarioController.js
│   │   └── reporteController.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── rolModel.js
│   │   └── usuarioModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   └── reporteRoutes.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   ├── jwt.js
│   │   └── pagination.js
│   └── app.js
├── scripts/
│   ├── init.sql           # Script de inicialización
│   └── seed.sql           # Datos iniciales
├── Dockerfile
├── docker-compose.yml
├── package.json
└── server.js
```

## 🔧 Scripts NPM

```bash
npm run dev      # Desarrollo con nodemon
npm start        # Producción
npm run lint     # Linting con ESLint
npm run format   # Formateo con Prettier
```

## 🛡️ Seguridad

- **bcrypt** para hash de contraseñas
- **JWT** para autenticación
- **Helmet** para headers de seguridad
- **CORS** configurado
- **Rate limiting** en login
- **Validación** de entrada con Joi
- **Sanitización** de datos
- **Usuario no-root** en Docker

## 📝 Notas Importantes

1. **Contraseñas**: Deben tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
2. **Correos**: Deben tener formato válido y ser únicos
3. **Eliminación**: Por defecto es lógica (cambia estado a INACTIVO)
4. **Paginación**: Máximo 100 elementos por página
5. **Fechas**: Formato YYYY-MM-DD para reportes

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas, crear un issue en el repositorio.
