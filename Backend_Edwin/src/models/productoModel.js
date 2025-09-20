const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class ProductoModel {
  // Crear nuevo producto
  static async crear(datosProducto) {
    const cliente = await pool.connect();
    try {
      // Verificar que el SKU no exista (si se proporciona)
      if (datosProducto.sku) {
        const skuExiste = await cliente.query(
          'SELECT 1 FROM producto WHERE sku = $1',
          [datosProducto.sku]
        );
        
        if (skuExiste.rows.length > 0) {
          throw crearError('El SKU ya está registrado', 400);
        }
      }
      
      // Verificar que el código de barras no exista (si se proporciona)
      if (datosProducto.codigo_barras) {
        const codigoExiste = await cliente.query(
          'SELECT 1 FROM producto WHERE codigo_barras = $1',
          [datosProducto.codigo_barras]
        );
        
        if (codigoExiste.rows.length > 0) {
          throw crearError('El código de barras ya está registrado', 400);
        }
      }
      
      // Verificar que la categoría existe
      const categoriaExiste = await cliente.query(
        'SELECT 1 FROM categoria WHERE id_categoria = $1',
        [datosProducto.id_categoria]
      );
      
      if (categoriaExiste.rows.length === 0) {
        throw crearError('La categoría especificada no existe', 400);
      }

      // Verificar que la marca existe
      const marcaExiste = await cliente.query(
        'SELECT 1 FROM marca WHERE id_marca = $1',
        [datosProducto.id_marca]
      );
      
      if (marcaExiste.rows.length === 0) {
        throw crearError('La marca especificada no existe', 400);
      }
      
      // Validar fecha de vencimiento
      if (datosProducto.fecha_vencimiento) {
        const fechaVencimiento = new Date(datosProducto.fecha_vencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaVencimiento < hoy) {
          throw crearError('La fecha de vencimiento no puede ser anterior a hoy', 400);
        }
      }
      
      const resultado = await cliente.query(
        `INSERT INTO producto (nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id_producto, nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at`,
        [
          datosProducto.nombre,
          datosProducto.descripcion || null,
          datosProducto.sku || null,
          datosProducto.codigo_barras || null,
          datosProducto.id_categoria,
          datosProducto.id_marca,
          datosProducto.precio_unitario || 0.00,
          datosProducto.stock || 0,
          datosProducto.fecha_vencimiento || null,
          datosProducto.activo !== undefined ? datosProducto.activo : true
        ]
      );
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener producto por ID
  static async obtenerPorId(idProducto) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT p.id_producto, p.nombre, p.descripcion, p.sku, p.codigo_barras, p.id_categoria, p.id_marca,
                p.precio_unitario, p.stock, p.fecha_vencimiento, p.activo, p.created_at, p.updated_at,
                c.nombre as categoria_nombre, m.nombre as marca_nombre
         FROM producto p
         JOIN categoria c ON p.id_categoria = c.id_categoria
         JOIN marca m ON p.id_marca = m.id_marca
         WHERE p.id_producto = $1`,
        [idProducto]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Producto no encontrado', 404);
      }
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener productos con paginación y filtros
  static async obtenerTodos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT p.id_producto, p.nombre, p.descripcion, p.sku, p.codigo_barras, p.id_categoria, p.id_marca,
               p.precio_unitario, p.stock, p.fecha_vencimiento, p.activo, p.created_at, p.updated_at,
               c.nombre as categoria_nombre, m.nombre as marca_nombre
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        JOIN marca m ON p.id_marca = m.id_marca
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.activo !== undefined && filtros.activo !== '') {
        consulta += ` AND p.activo = $${contadorParametros}`;
        parametros.push(filtros.activo === 'true');
        contadorParametros++;
      }
      
      if (filtros.id_categoria) {
        consulta += ` AND p.id_categoria = $${contadorParametros}`;
        parametros.push(filtros.id_categoria);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(p.nombre) LIKE $${contadorParametros} OR 
          LOWER(p.descripcion) LIKE $${contadorParametros} OR 
          LOWER(p.sku) LIKE $${contadorParametros} OR 
          LOWER(p.codigo_barras) LIKE $${contadorParametros} OR
          LOWER(c.nombre) LIKE $${contadorParametros} OR
          LOWER(m.nombre) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      const consultaCount = consulta.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY p.created_at DESC`;
      if (paginacion.limite) {
        consulta += ` LIMIT $${contadorParametros}`;
        parametros.push(paginacion.limite);
        contadorParametros++;
      }
      
      if (paginacion.offset) {
        consulta += ` OFFSET $${contadorParametros}`;
        parametros.push(paginacion.offset);
      }
      
      const resultado = await cliente.query(consulta, parametros);
      
      return {
        productos: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Actualizar producto
  static async actualizar(idProducto, datosActualizacion) {
    const cliente = await pool.connect();
    try {
      // Verificar que el producto existe
      const productoExiste = await cliente.query(
        'SELECT 1 FROM producto WHERE id_producto = $1',
        [idProducto]
      );
      
      if (productoExiste.rows.length === 0) {
        throw crearError('Producto no encontrado', 404);
      }
      
      // Verificar que el SKU no esté en uso por otro producto
      if (datosActualizacion.sku) {
        const skuExiste = await cliente.query(
          'SELECT 1 FROM producto WHERE sku = $1 AND id_producto != $2',
          [datosActualizacion.sku, idProducto]
        );
        
        if (skuExiste.rows.length > 0) {
          throw crearError('El SKU ya está en uso por otro producto', 400);
        }
      }
      
      // Verificar que el código de barras no esté en uso por otro producto
      if (datosActualizacion.codigo_barras) {
        const codigoExiste = await cliente.query(
          'SELECT 1 FROM producto WHERE codigo_barras = $1 AND id_producto != $2',
          [datosActualizacion.codigo_barras, idProducto]
        );
        
        if (codigoExiste.rows.length > 0) {
          throw crearError('El código de barras ya está en uso por otro producto', 400);
        }
      }
      
      // Verificar que la categoría existe si se está actualizando
      if (datosActualizacion.id_categoria) {
        const categoriaExiste = await cliente.query(
          'SELECT 1 FROM categoria WHERE id_categoria = $1',
          [datosActualizacion.id_categoria]
        );
        
        if (categoriaExiste.rows.length === 0) {
          throw crearError('La categoría especificada no existe o está inactiva', 400);
        }
      }

      // Verificar que la marca existe si se está actualizando
      if (datosActualizacion.id_marca) {
        const marcaExiste = await cliente.query(
          'SELECT 1 FROM marca WHERE id_marca = $1',
          [datosActualizacion.id_marca]
        );
        
        if (marcaExiste.rows.length === 0) {
          throw crearError('La marca especificada no existe o está inactiva', 400);
        }
      }
      
      // Validar fecha de vencimiento
      if (datosActualizacion.fecha_vencimiento) {
        const fechaVencimiento = new Date(datosActualizacion.fecha_vencimiento);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaVencimiento < hoy) {
          throw crearError('La fecha de vencimiento no puede ser anterior a hoy', 400);
        }
      }
      
      // Construir consulta de actualización
      const camposActualizables = ['nombre', 'descripcion', 'sku', 'codigo_barras', 'id_categoria', 'id_marca', 'precio_unitario', 'stock', 'fecha_vencimiento', 'activo'];
      const camposParaActualizar = [];
      const valores = [];
      let contadorParametros = 1;
      
      camposActualizables.forEach(campo => {
        if (datosActualizacion[campo] !== undefined) {
          camposParaActualizar.push(`${campo} = $${contadorParametros}`);
          valores.push(datosActualizacion[campo]);
          contadorParametros++;
        }
      });
      
      if (camposParaActualizar.length === 0) {
        throw crearError('No hay campos para actualizar', 400);
      }
      
      valores.push(idProducto);
      
      const consulta = `
        UPDATE producto 
        SET ${camposParaActualizar.join(', ')}, updated_at = NOW()
        WHERE id_producto = $${contadorParametros}
        RETURNING id_producto, nombre, descripcion, sku, codigo_barras, id_categoria, id_marca, precio_unitario, stock, fecha_vencimiento, activo, created_at, updated_at
      `;
      
      const resultado = await cliente.query(consulta, valores);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Eliminar producto (soft delete)
  static async eliminar(idProducto) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'UPDATE producto SET activo = false, updated_at = NOW() WHERE id_producto = $1 RETURNING id_producto',
        [idProducto]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Producto no encontrado', 404);
      }
      
      return { mensaje: 'Producto eliminado correctamente' };
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de productos
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_productos,
          COUNT(CASE WHEN activo = true THEN 1 END) as productos_activos,
          COUNT(CASE WHEN activo = false THEN 1 END) as productos_inactivos,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as nuevos_ultimo_mes,
          COUNT(CASE WHEN stock <= 0 THEN 1 END) as productos_sin_stock,
          COUNT(CASE WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as productos_por_vencer,
          SUM(precio_unitario * stock) as valor_total_inventario
        FROM producto
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener productos por rango de fechas
  static async obtenerPorRangoFechas(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT p.id_producto, p.nombre, p.descripcion, p.sku, p.codigo_barras, p.id_categoria, 
                p.precio_unitario, p.stock, p.fecha_vencimiento, p.activo, p.created_at, p.updated_at,
                c.nombre as categoria_nombre
         FROM producto p
         JOIN categoria c ON p.id_categoria = c.id_categoria
         WHERE p.created_at >= $1 AND p.created_at <= $2
         ORDER BY p.created_at DESC`,
        [desde, hasta]
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Verificar si un producto existe
  static async existe(idProducto) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM producto WHERE id_producto = $1',
        [idProducto]
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // MÉTODOS PARA REPORTES
  // ========================================

  // Obtener stock actual con filtros
  static async obtenerStockActual(filtros = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT 
          p.id_producto,
          p.nombre,
          p.sku,
          p.codigo_barras,
          p.precio_unitario,
          p.stock,
          p.fecha_vencimiento,
          p.activo,
          c.nombre as categoria_nombre,
          m.nombre as marca_nombre,
          CASE 
            WHEN p.fecha_vencimiento IS NOT NULL AND p.fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' 
            THEN true 
            ELSE false 
          END as proximo_vencer
        FROM producto p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN marca m ON p.id_marca = m.id_marca
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.categoria_id) {
        consulta += ` AND p.id_categoria = $${contadorParametros}`;
        parametros.push(filtros.categoria_id);
        contadorParametros++;
      }
      
      if (filtros.marca_id) {
        consulta += ` AND p.id_marca = $${contadorParametros}`;
        parametros.push(filtros.marca_id);
        contadorParametros++;
      }
      
      if (filtros.stock_bajo) {
        consulta += ` AND p.stock <= 10`;
      }
      
      consulta += ` ORDER BY p.nombre ASC`;
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener productos próximos a vencer
  static async obtenerProductosProximosAVencer(dias = 30) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          p.id_producto,
          p.nombre,
          p.sku,
          p.stock,
          p.fecha_vencimiento,
          c.nombre as categoria_nombre,
          m.nombre as marca_nombre,
          (p.fecha_vencimiento - CURRENT_DATE) as dias_restantes
        FROM producto p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN marca m ON p.id_marca = m.id_marca
        WHERE p.fecha_vencimiento IS NOT NULL 
          AND p.fecha_vencimiento <= CURRENT_DATE + INTERVAL '${dias} days'
          AND p.activo = true
        ORDER BY p.fecha_vencimiento ASC
      `;
      
      const resultado = await cliente.query(consulta);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener productos por categoría
  static async obtenerProductosPorCategoria(activo = true) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          c.id_categoria,
          c.nombre as categoria_nombre,
          c.descripcion as categoria_descripcion,
          COUNT(p.id_producto) as total_productos,
          COALESCE(SUM(p.stock), 0) as total_stock,
          COALESCE(AVG(p.precio_unitario), 0) as precio_promedio,
          COALESCE(SUM(p.stock * p.precio_unitario), 0) as valor_total_inventario
        FROM categoria c
        LEFT JOIN producto p ON c.id_categoria = p.id_categoria AND p.activo = $1
        WHERE c.activo = true
        GROUP BY c.id_categoria, c.nombre, c.descripcion
        ORDER BY total_productos DESC
      `;
      
      const resultado = await cliente.query(consulta, [activo]);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener productos por marca
  static async obtenerProductosPorMarca(activo = true) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          m.id_marca,
          m.nombre as marca_nombre,
          m.descripcion as marca_descripcion,
          COUNT(p.id_producto) as total_productos,
          COALESCE(SUM(p.stock), 0) as total_stock,
          COALESCE(AVG(p.precio_unitario), 0) as precio_promedio,
          COALESCE(SUM(p.stock * p.precio_unitario), 0) as valor_total_inventario
        FROM marca m
        LEFT JOIN producto p ON m.id_marca = p.id_marca AND p.activo = $1
        WHERE m.activo = true
        GROUP BY m.id_marca, m.nombre, m.descripcion
        ORDER BY total_productos DESC
      `;
      
      const resultado = await cliente.query(consulta, [activo]);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }
}

module.exports = ProductoModel;
