
admin@dominio.com
Admin123!

BEGIN;

-- =========================================================
-- FUNCIÓN: set_updated_at
-- ---------------------------------------------------------
-- Esta función se utiliza en triggers de las tablas para 
-- actualizar automáticamente la columna "updated_at" cada 
-- vez que se haga un UPDATE sobre la fila.
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW(); -- Actualiza la marca de tiempo
  RETURN NEW;
END;
$$;


-- =========================================================
-- TABLA: marca  (también puede llamarse laboratorio/casa_medica)
-- ---------------------------------------------------------
-- Catálogo de marcas comerciales o laboratorios/casas médicas.
-- Úsalo para normalizar y evitar texto libre en productos.
-- =========================================================
CREATE TABLE IF NOT EXISTS marca (
  id_marca     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Identificador único
  nombre       VARCHAR(120) NOT NULL,                           -- Nombre de la marca/laboratorio
  descripcion  VARCHAR(255),                                    -- Descripción opcional
  activo       BOOLEAN NOT NULL DEFAULT TRUE,                   -- Soft delete
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_marca__nombre UNIQUE (nombre),                  -- Evita duplicados por nombre
  CONSTRAINT chk_marca__nombre_no_vacio CHECK (btrim(nombre) <> '')
);

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS ix_marca__activo ON marca (activo);

-- Trigger updated_at
DROP TRIGGER IF EXISTS tr_marca__updated_at ON marca;
CREATE TRIGGER tr_marca__updated_at
BEFORE UPDATE ON marca
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();


-- =========================================================
-- TABLA: categoria
-- ---------------------------------------------------------
-- Catálogo de familias o clasificaciones de productos.
-- Ejemplos: 'Analgésicos', 'Vitaminas', 'Antibióticos'.
-- =========================================================
CREATE TABLE IF NOT EXISTS categoria (
  id_categoria  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Identificador único
  nombre        VARCHAR(100) NOT NULL,                          -- Nombre de la categoría
  descripcion   VARCHAR(255),                                   -- Descripción opcional
  activo        BOOLEAN NOT NULL DEFAULT TRUE,                  -- Activo/Inactivo (soft delete)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),             -- Fecha de creación
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),             -- Última actualización
  CONSTRAINT uq_categoria__nombre UNIQUE (nombre),              -- Evita duplicados de nombre
  CONSTRAINT chk_categoria__nombre_no_vacio CHECK (btrim(nombre) <> '') -- Valida no vacío
);

-- Índice auxiliar para filtrar categorías activas rápidamente
CREATE INDEX IF NOT EXISTS ix_categoria__activo ON categoria (activo);

-- Trigger que actualiza la columna updated_at en cada UPDATE
DROP TRIGGER IF EXISTS tr_categoria__updated_at ON categoria;
CREATE TRIGGER tr_categoria__updated_at
BEFORE UPDATE ON categoria
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- TABLA: cliente
-- ---------------------------------------------------------
-- Maestro de clientes (personas o empresas).
-- Incluye validaciones básicas para NIT, email y teléfono.
-- =========================================================
CREATE TABLE IF NOT EXISTS cliente (
  id_cliente      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- Identificador único
  nombres         VARCHAR(120) NOT NULL,                          -- Nombres o razón social
  apellidos       VARCHAR(120),                                   -- Apellidos (opcional en empresas)
  nit             VARCHAR(20),                                    -- Número de Identificación Tributaria
  email           VARCHAR(160),                                   -- Email con validación básica
  telefono        VARCHAR(25),                                    -- Teléfono con validación básica
  direccion       VARCHAR(200),                                   -- Dirección del cliente
  observaciones   VARCHAR(300),                                   -- Notas adicionales
  activo          BOOLEAN NOT NULL DEFAULT TRUE,                  -- Activo/Inactivo (soft delete)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),             -- Fecha de creación
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),             -- Última actualización

  -- Reglas de negocio mínimas
  CONSTRAINT chk_cliente__nombres_no_vacio CHECK (btrim(nombres) <> ''),

  -- Restricciones de unicidad
  CONSTRAINT uq_cliente__nit UNIQUE (nit),
  CONSTRAINT uq_cliente__email UNIQUE (email),

  -- Validación de formato de email
  CONSTRAINT chk_cliente__email_formato
    CHECK (email IS NULL OR email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'),

  -- Validación de formato de teléfono
  CONSTRAINT chk_cliente__tel_formato
    CHECK (telefono IS NULL OR telefono ~* '^[0-9+\-() ]{7,25}$')
);

-- Índices auxiliares para mejorar rendimiento en consultas
CREATE INDEX IF NOT EXISTS ix_cliente__activo ON cliente (activo);
CREATE INDEX IF NOT EXISTS ix_cliente__nombres ON cliente (nombres);
CREATE INDEX IF NOT EXISTS ix_cliente__apellidos ON cliente (apellidos);

-- Trigger que actualiza la columna updated_at en cada UPDATE
DROP TRIGGER IF EXISTS tr_cliente__updated_at ON cliente;
CREATE TRIGGER tr_cliente__updated_at
BEFORE UPDATE ON cliente
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- TABLA: producto
-- ---------------------------------------------------------
-- Maestro de productos, relacionado con categoria y marca.
-- Incluye SKU, código de barras, precio, stock y vencimiento.
-- NOTA: Si la tabla ya existía sin 'id_marca', abajo hay un
--       bloque de migración para añadirla de forma segura.
-- =========================================================
CREATE TABLE IF NOT EXISTS producto (
  id_producto       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre            VARCHAR(140) NOT NULL,
  descripcion       VARCHAR(500),
  sku               VARCHAR(40),
  codigo_barras     VARCHAR(64),
  id_categoria      BIGINT NOT NULL REFERENCES categoria(id_categoria)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
  -- Relación a marca (puede ser NULL si aún no catalogas marcas)
  id_marca          BIGINT REFERENCES marca(id_marca)
                                  ON UPDATE RESTRICT ON DELETE RESTRICT,
  precio_unitario   NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  stock             INTEGER NOT NULL DEFAULT 0,
  fecha_vencimiento DATE,
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Reglas/validaciones
  CONSTRAINT uq_producto__sku UNIQUE (sku),
  CONSTRAINT uq_producto__codigo_barras UNIQUE (codigo_barras),
  CONSTRAINT chk_producto__nombre_no_vacio CHECK (btrim(nombre) <> ''),
  CONSTRAINT chk_producto__precio_nonneg CHECK (precio_unitario >= 0),
  CONSTRAINT chk_producto__stock_nonneg  CHECK (stock >= 0)
);

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS ix_producto__categoria ON producto (id_categoria);
CREATE INDEX IF NOT EXISTS ix_producto__marca     ON producto (id_marca);
CREATE INDEX IF NOT EXISTS ix_producto__nombre    ON producto (nombre);
CREATE INDEX IF NOT EXISTS ix_producto__activo    ON producto (activo);

DROP TRIGGER IF EXISTS tr_producto__updated_at ON producto;
CREATE TRIGGER tr_producto__updated_at
BEFORE UPDATE ON producto
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
