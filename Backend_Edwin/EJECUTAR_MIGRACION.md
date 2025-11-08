# Instrucciones para Ejecutar la Migración de Presentaciones

## Opción 1: Desde la línea de comandos (si tienes acceso directo a PostgreSQL)

```bash
cd Backend_Edwin
psql -U tu_usuario -d todofarma -f db/migracion_presentaciones.sql
```

## Opción 2: Desde pgAdmin o cliente SQL

1. Abre tu cliente SQL favorito (pgAdmin, DBeaver, etc.)
2. Conéctate a la base de datos `todofarma`
3. Ejecuta el contenido del archivo `Backend_Edwin/db/migracion_presentaciones.sql`

## Opción 3: Ejecutar directamente en psql

```bash
psql -U postgres -d todofarma
```

Luego copia y pega el contenido del archivo SQL.

## Verificación

Después de ejecutar la migración, verifica que las columnas se agregaron correctamente:

```sql
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'producto' 
  AND column_name IN ('tipo_presentacion', 'cantidad_presentacion', 'unidad_medida');
```

Deberías ver 3 filas con las nuevas columnas.

