# Configuración del Backend TodoFarma

## Configuración Centralizada
La configuración del backend está centralizada en `src/app/config/app.config.ts`

## URL del Backend
```
http://localhost:3000
```

## Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/perfil` - Obtener perfil del usuario
- `POST /api/auth/cambiar-contrasena` - Cambiar contraseña

### Usuarios
- `GET /api/usuarios` - Listar usuarios (con paginación y filtros)
- `POST /api/usuarios` - Crear usuario
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario (inactivar)

### Reportes
- `GET /api/reportes/usuarios/activos` - Usuarios activos
- `GET /api/reportes/usuarios/inactivos` - Usuarios inactivos
- `GET /api/reportes/usuarios/por-fecha` - Usuarios por rango de fechas

## Credenciales por Defecto
- **Usuario**: admin@todofarma.com
- **Contraseña**: Admin123!

## Para cambiar la configuración del backend:
1. Edita el archivo `src/app/config/app.config.ts`
2. Modifica las propiedades `baseUrl` y `port` según necesites
3. La aplicación se actualizará automáticamente

## Para iniciar el backend:
```bash
cd ../Backend
npm run dev
```

## Para verificar que el backend esté funcionando:
```bash
curl http://localhost:3000/api/auth/login
```
