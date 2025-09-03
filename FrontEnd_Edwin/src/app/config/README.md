# Configuración Centralizada del Backend

## Descripción
Este directorio contiene toda la configuración centralizada de la aplicación TodoFarma, especialmente la configuración del backend.

## Archivos

### `app.config.ts`
Configuración principal de la aplicación que incluye:
- Configuración del backend
- Información de la aplicación
- Funciones helper para acceder a la configuración

### `backend.config.ts`
Configuración específica del backend con diferentes entornos:
- **Development**: `http://localhost:3000`
- **Production**: `https://api.todofarma.com` (configurable)
- **Staging**: Configurable según necesidades

## Cómo cambiar la configuración del backend

### 1. Cambiar la URL del backend
Edita el archivo `backend.config.ts`:

```typescript
export const BACKEND_CONFIG: BackendConfig = {
  development: {
    baseUrl: 'http://192.168.1.100', // Cambiar IP
    port: 8080,                      // Cambiar puerto
    apiUrl: 'http://192.168.1.100:8080/api'
  },
  production: {
    baseUrl: 'https://mi-backend.com',
    port: 443,
    apiUrl: 'https://mi-backend.com/api'
  }
};
```

### 2. Cambiar en tiempo de ejecución
```typescript
import { updateBackendConfig } from './config/app.config';

// Cambiar a producción
updateBackendConfig('production');

// Cambiar a desarrollo
updateBackendConfig('development');
```

### 3. Usar en servicios
```typescript
import { getBackendUrl } from './config/app.config';

// En lugar de hardcodear la URL
return this.http.get(`${getBackendUrl()}/usuarios`);
```

## Ventajas de la configuración centralizada

✅ **Un solo lugar para cambiar**: Modifica la URL del backend en un solo archivo
✅ **Diferentes entornos**: Fácil cambio entre desarrollo, staging y producción
✅ **Mantenimiento**: No más búsquedas en múltiples archivos
✅ **Consistencia**: Todas las partes de la aplicación usan la misma configuración
✅ **Flexibilidad**: Cambio de configuración en tiempo de ejecución

## Estructura de archivos que usan esta configuración

- `src/environments/environment.ts` → Usa `APP_CONFIG.backend.apiUrl`
- `src/environments/environment.prod.ts` → Usa `APP_CONFIG.backend.apiUrl`
- `src/app/services/*.ts` → Usan `environment.apiUrl`
- `start-project.sh` → Variables configurables
- `backend-config.md` → Documentación actualizada

## Notas importantes

⚠️ **Después de cambiar la configuración**: 
- Reinicia la aplicación Angular
- Verifica que el backend esté accesible en la nueva URL
- Actualiza la documentación si es necesario

🔧 **Para agregar nuevos entornos**:
1. Agrega el nuevo entorno en `backend.config.ts`
2. Actualiza la interfaz `BackendConfig`
3. Usa `updateBackendConfig('nuevo-entorno')`
