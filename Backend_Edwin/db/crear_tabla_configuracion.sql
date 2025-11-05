-- =========================================================
-- TABLA: configuracion_sistema
-- =========================================================
-- Esta tabla almacena la configuración general del sistema
-- Solo debe tener un registro (singleton)
-- =========================================================

CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id_configuracion SERIAL PRIMARY KEY,
    
    -- Configuración de formato del sistema
    formato_fecha VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    formato_hora VARCHAR(10) DEFAULT '24h',
    formato_moneda VARCHAR(10) DEFAULT 'Q',
    separador_decimal VARCHAR(5) DEFAULT ',',
    separador_miles VARCHAR(5) DEFAULT '.',
    idioma VARCHAR(10) DEFAULT 'es',
    zona_horaria VARCHAR(50) DEFAULT 'America/Guatemala',
    
    -- Datos de facturación
    nit VARCHAR(20) DEFAULT '',
    nombre_empresa VARCHAR(200) DEFAULT 'Farmacia TodoFarma',
    mensaje_factura TEXT DEFAULT 'Gracias por su compra. Vuelva pronto.',
    mensaje_pie TEXT DEFAULT 'Conserve este comprobante para garantías',
    
    -- Dirección de la empresa
    direccion TEXT DEFAULT '',
    ciudad VARCHAR(100) DEFAULT '',
    departamento VARCHAR(100) DEFAULT '',
    codigo_postal VARCHAR(20) DEFAULT '',
    pais VARCHAR(100) DEFAULT 'Guatemala',
    
    -- Teléfonos y contacto de la empresa
    telefono_principal VARCHAR(25) DEFAULT '',
    telefono_secundario VARCHAR(25) DEFAULT '',
    fax VARCHAR(25) DEFAULT '',
    whatsapp VARCHAR(25) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    sitio_web VARCHAR(255) DEFAULT '',
    
    -- Campos de control
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Crear índice único para asegurar que solo haya un registro
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracion_singleton ON configuracion_sistema ((1));

-- Insertar registro inicial si no existe
INSERT INTO configuracion_sistema (id_configuracion)
VALUES (1)
ON CONFLICT (id_configuracion) DO NOTHING;

-- Comentarios en la tabla
COMMENT ON TABLE configuracion_sistema IS 'Configuración general del sistema TodoFarma';
COMMENT ON COLUMN configuracion_sistema.id_configuracion IS 'ID único de la configuración (siempre será 1)';
COMMENT ON COLUMN configuracion_sistema.formato_fecha IS 'Formato de fecha: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD';
COMMENT ON COLUMN configuracion_sistema.formato_hora IS 'Formato de hora: 24h o 12h';
COMMENT ON COLUMN configuracion_sistema.formato_moneda IS 'Símbolo de moneda: Q, $, €, etc.';
COMMENT ON COLUMN configuracion_sistema.nit IS 'NIT de la empresa';
COMMENT ON COLUMN configuracion_sistema.nombre_empresa IS 'Nombre completo de la empresa';
