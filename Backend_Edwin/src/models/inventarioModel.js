const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class InventarioModel {
  // Obtener movimientos de inventario con paginación y filtros
  static async obtenerMovimientos(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT im.id_mov, im.producto_id, im.fecha, im.tipo, im.cantidad, im.signo, im.referencia,
               im.pedido_id, im.venta_id, im.usuario_id, im.observacion, im.created_at,
               p.nombre as producto_nombre, p.sku, p.codigo_barras,
               u.nombre as usuario_nombre
        FROM inventario_movimiento im
        JOIN producto p ON im.producto_id = p.id_producto
        LEFT JOIN usuarios u ON im.usuario_id = u.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.producto_id) {
        consulta += ` AND im.producto_id = $${contadorParametros}`;
        parametros.push(filtros.producto_id);
        contadorParametros++;
      }
      
      if (filtros.tipo) {
        consulta += ` AND im.tipo = $${contadorParametros}`;
        parametros.push(filtros.tipo);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND im.fecha >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND im.fecha <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(p.nombre) LIKE $${contadorParametros} OR 
          LOWER(p.sku) LIKE $${contadorParametros} OR 
          LOWER(im.referencia) LIKE $${contadorParametros} OR
          LOWER(im.observacion) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      let consultaCount = `
        SELECT COUNT(*) as total
        FROM inventario_movimiento im
        JOIN producto p ON im.producto_id = p.id_producto
        LEFT JOIN usuarios u ON im.usuario_id = u.id_usuario
        WHERE 1=1
      `;
      
      const parametrosCount = [];
      let contadorCount = 1;
      
      if (filtros.producto_id) {
        consultaCount += ` AND im.producto_id = $${contadorCount}`;
        parametrosCount.push(filtros.producto_id);
        contadorCount++;
      }
      
      if (filtros.tipo) {
        consultaCount += ` AND im.tipo = $${contadorCount}`;
        parametrosCount.push(filtros.tipo);
        contadorCount++;
      }
      
      if (filtros.fecha_desde) {
        consultaCount += ` AND im.fecha >= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_desde);
        contadorCount++;
      }
      
      if (filtros.fecha_hasta) {
        consultaCount += ` AND im.fecha <= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_hasta);
        contadorCount++;
      }
      
      if (filtros.busqueda) {
        consultaCount += ` AND (
          LOWER(p.nombre) LIKE $${contadorCount} OR 
          LOWER(p.sku) LIKE $${contadorCount} OR 
          LOWER(im.referencia) LIKE $${contadorCount} OR
          LOWER(im.observacion) LIKE $${contadorCount}
        )`;
        parametrosCount.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorCount++;
      }
      
      const resultadoCount = await cliente.query(consultaCount, parametrosCount);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY im.fecha DESC, im.id_mov DESC`;
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
        movimientos: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener kardex de un producto específico
  static async obtenerKardexProducto(idProducto, filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT im.id_mov, im.fecha, im.tipo, im.cantidad, im.signo, im.referencia,
               im.pedido_id, im.venta_id, im.usuario_id, im.observacion, im.created_at,
               u.nombre as usuario_nombre
        FROM inventario_movimiento im
        LEFT JOIN usuarios u ON im.usuario_id = u.id_usuario
        WHERE im.producto_id = $1
      `;
      
      const parametros = [idProducto];
      let contadorParametros = 2;
      
      // Aplicar filtros
      if (filtros.tipo) {
        consulta += ` AND im.tipo = $${contadorParametros}`;
        parametros.push(filtros.tipo);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND im.fecha >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND im.fecha <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(im.referencia) LIKE $${contadorParametros} OR
          LOWER(im.observacion) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      let consultaCount = `
        SELECT COUNT(*) as total
        FROM inventario_movimiento im
        WHERE im.producto_id = $1
      `;
      
      const parametrosCount = [idProducto];
      let contadorCount = 2;
      
      if (filtros.tipo) {
        consultaCount += ` AND im.tipo = $${contadorCount}`;
        parametrosCount.push(filtros.tipo);
        contadorCount++;
      }
      
      if (filtros.fecha_desde) {
        consultaCount += ` AND im.fecha >= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_desde);
        contadorCount++;
      }
      
      if (filtros.fecha_hasta) {
        consultaCount += ` AND im.fecha <= $${contadorCount}`;
        parametrosCount.push(filtros.fecha_hasta);
        contadorCount++;
      }
      
      if (filtros.busqueda) {
        consultaCount += ` AND (
          LOWER(im.referencia) LIKE $${contadorCount} OR
          LOWER(im.observacion) LIKE $${contadorCount}
        )`;
        parametrosCount.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorCount++;
      }
      
      const resultadoCount = await cliente.query(consultaCount, parametrosCount);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY im.fecha DESC, im.id_mov DESC`;
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
        movimientos: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener productos con stock bajo
  static async obtenerProductosBajoStock(limiteStock = 10) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT p.id_producto, p.nombre, p.sku, p.stock, p.precio_unitario as precio_venta
        FROM producto p
        WHERE p.stock <= $1
        ORDER BY p.stock ASC, p.nombre ASC
      `;
      
      const resultado = await cliente.query(consulta, [limiteStock]);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener productos por vencer
  static async obtenerProductosPorVencer(dias = 30) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT p.id_producto, p.nombre, p.sku, p.stock, p.fecha_vencimiento,
               (p.fecha_vencimiento - CURRENT_DATE) as dias_para_vencer
        FROM producto p
        WHERE p.fecha_vencimiento IS NOT NULL 
        AND p.fecha_vencimiento <= (CURRENT_DATE + INTERVAL '${dias} days')
        ORDER BY p.fecha_vencimiento ASC, p.nombre ASC
      `;
      
      const resultado = await cliente.query(consulta);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de inventario
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          (SELECT COUNT(*) FROM inventario_movimiento) as total_movimientos,
          (SELECT COUNT(*) FROM inventario_movimiento WHERE signo = 1) as total_entradas,
          (SELECT COUNT(*) FROM inventario_movimiento WHERE signo = -1) as total_salidas,
          (SELECT COUNT(*) FROM producto) as total_productos
      `;
      
      const resultado = await cliente.query(consulta);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener resumen por categoría
  static async obtenerResumenCategoria() {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          'Sin categoría' as categoria,
          COUNT(p.id_producto) as total_productos,
          SUM(p.stock) as stock_total,
          AVG(p.stock) as stock_promedio,
          SUM(p.stock * p.precio_unitario) as valor_total
        FROM producto p
        WHERE p.id_categoria IS NULL
        UNION ALL
        SELECT 
          c.nombre as categoria,
          COUNT(p.id_producto) as total_productos,
          SUM(p.stock) as stock_total,
          AVG(p.stock) as stock_promedio,
          SUM(p.stock * p.precio_unitario) as valor_total
        FROM categoria c
        LEFT JOIN producto p ON c.id_categoria = p.id_categoria
        GROUP BY c.id_categoria, c.nombre
        ORDER BY total_productos DESC
      `;
      
      const resultado = await cliente.query(consulta);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Crear movimiento de inventario
  static async crearMovimiento(datos) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        INSERT INTO inventario_movimiento 
        (producto_id, tipo, cantidad, signo, referencia, pedido_id, venta_id, usuario_id, observacion)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const parametros = [
        datos.producto_id,
        datos.tipo,
        datos.cantidad,
        datos.signo,
        datos.referencia || null,
        datos.pedido_id || null,
        datos.venta_id || null,
        datos.usuario_id || null,
        datos.observacion || null
      ];
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }
}

module.exports = InventarioModel;