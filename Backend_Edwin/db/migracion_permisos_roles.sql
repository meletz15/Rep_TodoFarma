-- Migración: Agregar columna permisos a la tabla roles
-- Esta columna almacenará un JSON con los permisos de cada rol

-- Agregar columna permisos si no existe
ALTER TABLE roles 
ADD COLUMN IF NOT EXISTS permisos JSONB DEFAULT '{}'::jsonb;

-- Agregar comentario a la columna
COMMENT ON COLUMN roles.permisos IS 'JSON con los permisos del rol. Ejemplo: {"ventas": true, "caja": true, "gestion_pedidos": false}';

-- Actualizar roles existentes con permisos por defecto (todos activos para ADMIN, limitados para otros)
UPDATE roles 
SET permisos = '{
  "ventas": true,
  "productos": true,
  "caja": true,
  "clientes": true,
  "proveedores": true,
  "gestion_pedidos": true,
  "inventario": true,
  "reportes": true,
  "usuarios": true,
  "configuracion": true,
  "carga": true,
  "dashboard": true
}'::jsonb
WHERE nombre = 'ADMIN';

UPDATE roles 
SET permisos = '{
  "ventas": true,
  "productos": true,
  "caja": true,
  "clientes": true,
  "proveedores": false,
  "gestion_pedidos": true,
  "inventario": true,
  "reportes": true,
  "usuarios": false,
  "configuracion": false,
  "carga": false,
  "dashboard": true
}'::jsonb
WHERE nombre = 'EMPLEADO';

UPDATE roles 
SET permisos = '{
  "ventas": false,
  "productos": false,
  "caja": false,
  "clientes": false,
  "proveedores": false,
  "gestion_pedidos": false,
  "inventario": false,
  "reportes": false,
  "usuarios": false,
  "configuracion": false,
  "carga": false,
  "dashboard": true
}'::jsonb
WHERE nombre = 'INVITADO';

-- Crear índice para búsquedas en permisos si es necesario
CREATE INDEX IF NOT EXISTS idx_roles_permisos ON roles USING GIN (permisos);

