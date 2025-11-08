-- =========================================================
-- ACTUALIZAR PRESENTACIONES DE PRODUCTOS EXISTENTES
-- =========================================================
-- Este script asigna presentaciones a productos existentes
-- basándose en sus nombres y características

-- Primero, veamos qué productos tenemos
SELECT id_producto, nombre, sku, stock 
FROM producto 
WHERE activo = true 
ORDER BY nombre
LIMIT 20;

-- Actualizar productos basándose en palabras clave en el nombre
-- Tabletas
UPDATE producto 
SET 
  tipo_presentacion = 'Tabletas',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%10%' OR nombre ILIKE '%diez%' THEN 10
    WHEN nombre ILIKE '%20%' OR nombre ILIKE '%veinte%' THEN 20
    WHEN nombre ILIKE '%30%' OR nombre ILIKE '%treinta%' THEN 30
    WHEN nombre ILIKE '%50%' OR nombre ILIKE '%cincuenta%' THEN 50
    WHEN nombre ILIKE '%100%' OR nombre ILIKE '%cien%' THEN 100
    ELSE 20
  END,
  unidad_medida = 'tabletas'
WHERE (nombre ILIKE '%tableta%' OR nombre ILIKE '%tablet%' OR nombre ILIKE '%tab%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Cápsulas
UPDATE producto 
SET 
  tipo_presentacion = 'Cápsulas',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%10%' OR nombre ILIKE '%diez%' THEN 10
    WHEN nombre ILIKE '%20%' OR nombre ILIKE '%veinte%' THEN 20
    WHEN nombre ILIKE '%30%' OR nombre ILIKE '%treinta%' THEN 30
    WHEN nombre ILIKE '%50%' OR nombre ILIKE '%cincuenta%' THEN 50
    WHEN nombre ILIKE '%100%' OR nombre ILIKE '%cien%' THEN 100
    ELSE 20
  END,
  unidad_medida = 'cápsulas'
WHERE (nombre ILIKE '%capsula%' OR nombre ILIKE '%capsule%' OR nombre ILIKE '%cap%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Blisters
UPDATE producto 
SET 
  tipo_presentacion = 'Blister',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%10%' OR nombre ILIKE '%diez%' THEN 10
    WHEN nombre ILIKE '%20%' OR nombre ILIKE '%veinte%' THEN 20
    WHEN nombre ILIKE '%30%' OR nombre ILIKE '%treinta%' THEN 30
    WHEN nombre ILIKE '%50%' OR nombre ILIKE '%cincuenta%' THEN 50
    WHEN nombre ILIKE '%100%' OR nombre ILIKE '%cien%' THEN 100
    ELSE 20
  END,
  unidad_medida = 'tabletas'
WHERE nombre ILIKE '%blister%'
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Jarabes
UPDATE producto 
SET 
  tipo_presentacion = 'Jarabe',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%60%' OR nombre ILIKE '%sesenta%' THEN 60
    WHEN nombre ILIKE '%100%' OR nombre ILIKE '%cien%' THEN 100
    WHEN nombre ILIKE '%120%' OR nombre ILIKE '%ciento veinte%' THEN 120
    WHEN nombre ILIKE '%200%' OR nombre ILIKE '%doscientos%' THEN 200
    ELSE 100
  END,
  unidad_medida = 'ml'
WHERE (nombre ILIKE '%jarabe%' OR nombre ILIKE '%syrup%' OR nombre ILIKE '%suspension%' OR nombre ILIKE '%suspensión%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Inyecciones
UPDATE producto 
SET 
  tipo_presentacion = 'Inyección',
  cantidad_presentacion = 1,
  unidad_medida = 'unidades'
WHERE (nombre ILIKE '%inyeccion%' OR nombre ILIKE '%inyección%' OR nombre ILIKE '%ampolla%' OR nombre ILIKE '%ampula%' OR nombre ILIKE '%vial%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Gotas
UPDATE producto 
SET 
  tipo_presentacion = 'Gotas',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%10%' OR nombre ILIKE '%diez%' THEN 10
    WHEN nombre ILIKE '%15%' OR nombre ILIKE '%quince%' THEN 15
    WHEN nombre ILIKE '%20%' OR nombre ILIKE '%veinte%' THEN 20
    WHEN nombre ILIKE '%30%' OR nombre ILIKE '%treinta%' THEN 30
    ELSE 15
  END,
  unidad_medida = 'ml'
WHERE (nombre ILIKE '%gota%' OR nombre ILIKE '%drop%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Ungüentos y Cremas
UPDATE producto 
SET 
  tipo_presentacion = CASE 
    WHEN nombre ILIKE '%unguento%' OR nombre ILIKE '%ungüento%' THEN 'Ungüento'
    ELSE 'Crema'
  END,
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%15%' OR nombre ILIKE '%quince%' THEN 15
    WHEN nombre ILIKE '%30%' OR nombre ILIKE '%treinta%' THEN 30
    WHEN nombre ILIKE '%50%' OR nombre ILIKE '%cincuenta%' THEN 50
    WHEN nombre ILIKE '%100%' OR nombre ILIKE '%cien%' THEN 100
    ELSE 30
  END,
  unidad_medida = 'g'
WHERE (nombre ILIKE '%crema%' OR nombre ILIKE '%cream%' OR nombre ILIKE '%unguento%' OR nombre ILIKE '%ungüento%' OR nombre ILIKE '%pomada%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Polvos
UPDATE producto 
SET 
  tipo_presentacion = 'Polvo',
  cantidad_presentacion = CASE 
    WHEN nombre ILIKE '%5%' OR nombre ILIKE '%cinco%' THEN 5
    WHEN nombre ILIKE '%10%' OR nombre ILIKE '%diez%' THEN 10
    WHEN nombre ILIKE '%20%' OR nombre ILIKE '%veinte%' THEN 20
    WHEN nombre ILIKE '%50%' OR nombre ILIKE '%cincuenta%' THEN 50
    ELSE 10
  END,
  unidad_medida = 'g'
WHERE (nombre ILIKE '%polvo%' OR nombre ILIKE '%powder%')
  AND tipo_presentacion IS NULL
  AND activo = true;

-- Para productos que no coinciden con ningún patrón, asignar Tabletas por defecto
UPDATE producto 
SET 
  tipo_presentacion = 'Tabletas',
  cantidad_presentacion = 20,
  unidad_medida = 'tabletas'
WHERE tipo_presentacion IS NULL
  AND activo = true;

-- Verificar resultados
SELECT 
  id_producto,
  nombre,
  tipo_presentacion,
  cantidad_presentacion,
  unidad_medida,
  stock
FROM producto 
WHERE activo = true
ORDER BY tipo_presentacion, nombre
LIMIT 50;

-- Estadísticas de presentaciones asignadas
SELECT 
  tipo_presentacion,
  COUNT(*) as total_productos,
  AVG(cantidad_presentacion) as cantidad_promedio
FROM producto 
WHERE activo = true 
  AND tipo_presentacion IS NOT NULL
GROUP BY tipo_presentacion
ORDER BY total_productos DESC;

