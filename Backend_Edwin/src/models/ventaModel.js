const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class VentaModel {
  // Crear nueva venta
  static async crear(datosVenta) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      // Verificar que hay una caja abierta
      const cajaAbierta = await cliente.query(
        'SELECT id_caja FROM caja WHERE estado = $1 ORDER BY fecha_apertura DESC LIMIT 1',
        ['ABIERTO']
      );
      
      if (cajaAbierta.rows.length === 0) {
        throw crearError('No hay caja abierta. Debe abrir una caja antes de realizar ventas', 400);
      }

      const cajaId = cajaAbierta.rows[0].id_caja;

      // Verificar que el usuario existe
      const usuarioExiste = await cliente.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [datosVenta.usuario_id]
      );
      
      if (usuarioExiste.rows.length === 0) {
        throw crearError('El usuario especificado no existe', 400);
      }

      // Verificar que el cliente existe (si se proporciona)
      if (datosVenta.cliente_id) {
        const clienteExiste = await cliente.query(
          'SELECT 1 FROM cliente WHERE id_cliente = $1',
          [datosVenta.cliente_id]
        );
        
        if (clienteExiste.rows.length === 0) {
          throw crearError('El cliente especificado no existe', 400);
        }
      }

      // Crear la venta
      const resultadoVenta = await cliente.query(
        `INSERT INTO venta (fecha, cliente_id, usuario_id, caja_id, estado, total, observacion)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id_venta, fecha, cliente_id, usuario_id, caja_id, estado, total, observacion, created_at, updated_at`,
        [
          datosVenta.fecha || new Date(),
          datosVenta.cliente_id || null,
          datosVenta.usuario_id,
          cajaId,
          datosVenta.estado || 'EMITIDA',
          datosVenta.total || 0.00,
          datosVenta.observacion || null
        ]
      );

      const venta = resultadoVenta.rows[0];

      // Crear los detalles de la venta
      if (datosVenta.detalles && datosVenta.detalles.length > 0) {
        let totalCalculado = 0;

        for (const detalle of datosVenta.detalles) {
          // Verificar que el producto existe y tiene stock suficiente
          const productoExiste = await cliente.query(
            'SELECT stock, nombre FROM producto WHERE id_producto = $1',
            [detalle.id_producto]
          );
          
          if (productoExiste.rows.length === 0) {
            throw crearError(`El producto con ID ${detalle.id_producto} no existe`, 400);
          }

          const producto = productoExiste.rows[0];
          if (producto.stock < detalle.cantidad) {
            throw crearError(`Stock insuficiente para el producto "${producto.nombre}". Stock disponible: ${producto.stock}`, 400);
          }

          await cliente.query(
            `INSERT INTO venta_detalle (id_venta, id_producto, cantidad, precio_unitario)
             VALUES ($1, $2, $3, $4)`,
            [venta.id_venta, detalle.id_producto, detalle.cantidad, detalle.precio_unitario]
          );

          totalCalculado += detalle.cantidad * detalle.precio_unitario;
        }

        // Actualizar el total de la venta
        await cliente.query(
          'UPDATE venta SET total = $1 WHERE id_venta = $2',
          [totalCalculado, venta.id_venta]
        );

        venta.total = totalCalculado;
      }

      await cliente.query('COMMIT');
      return venta;
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener venta por ID con detalles
  static async obtenerPorId(idVenta) {
    const cliente = await pool.connect();
    try {
      
      // Obtener la venta con información del cliente y usuario
      const resultadoVenta = await cliente.query(
        `SELECT v.*, 
                CASE 
                  WHEN c.nombres IS NOT NULL AND c.apellidos IS NOT NULL 
                  THEN CONCAT(c.nombres, ' ', c.apellidos)
                  ELSE NULL
                END as cliente_nombre, 
                CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
         FROM venta v
         LEFT JOIN cliente c ON v.cliente_id = c.id_cliente
         JOIN usuarios u ON v.usuario_id = u.id_usuario
         WHERE v.id_venta = $1`,
        [idVenta]
      );
      
      if (resultadoVenta.rows.length === 0) {
        throw crearError('Venta no encontrada', 404);
      }

      const venta = resultadoVenta.rows[0];

      // Obtener los detalles de la venta
      const resultadoDetalles = await cliente.query(
        `SELECT vd.*, p.nombre as nombre_producto, p.sku
         FROM venta_detalle vd
         JOIN producto p ON vd.id_producto = p.id_producto
         WHERE vd.id_venta = $1`,
        [idVenta]
      );

      venta.detalles = resultadoDetalles.rows;
      
      return venta;
    } catch (error) {
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener ventas con paginación y filtros
  static async obtenerVentas(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT v.id_venta, v.fecha, v.cliente_id, v.usuario_id, v.caja_id, v.estado, v.total, v.observacion, v.created_at, v.updated_at,
               CASE 
                 WHEN c.nombres IS NOT NULL AND c.apellidos IS NOT NULL 
                 THEN CONCAT(c.nombres, ' ', c.apellidos)
                 ELSE NULL
               END as cliente_nombre, 
               CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM venta v
        LEFT JOIN cliente c ON v.cliente_id = c.id_cliente
        JOIN usuarios u ON v.usuario_id = u.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.estado) {
        consulta += ` AND v.estado = $${contadorParametros}`;
        parametros.push(filtros.estado);
        contadorParametros++;
      }
      
      if (filtros.cliente_id) {
        consulta += ` AND v.cliente_id = $${contadorParametros}`;
        parametros.push(filtros.cliente_id);
        contadorParametros++;
      }
      
      if (filtros.usuario_id) {
        consulta += ` AND v.usuario_id = $${contadorParametros}`;
        parametros.push(filtros.usuario_id);
        contadorParametros++;
      }
      
      if (filtros.caja_id) {
        consulta += ` AND v.caja_id = $${contadorParametros}`;
        parametros.push(filtros.caja_id);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND v.fecha >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND v.fecha <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.busqueda) {
        consulta += ` AND (
          LOWER(CONCAT(c.nombres, ' ', c.apellidos)) LIKE $${contadorParametros} OR 
          LOWER(v.observacion) LIKE $${contadorParametros}
        )`;
        parametros.push(`%${filtros.busqueda.toLowerCase()}%`);
        contadorParametros++;
      }
      
      // Contar total de registros
      const consultaCount = consulta.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY v.fecha DESC`;
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
        ventas: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Anular venta
  static async anularVenta(idVenta, motivo) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      // Verificar que la venta existe y está emitida
      const ventaExiste = await cliente.query(
        'SELECT estado FROM venta WHERE id_venta = $1',
        [idVenta]
      );
      
      if (ventaExiste.rows.length === 0) {
        throw crearError('Venta no encontrada', 404);
      }

      if (ventaExiste.rows[0].estado !== 'EMITIDA') {
        throw crearError('Solo se pueden anular ventas en estado EMITIDA', 400);
      }

      // Anular la venta
      const resultado = await cliente.query(
        'UPDATE venta SET estado = $1, observacion = $2, updated_at = NOW() WHERE id_venta = $3 RETURNING *',
        ['ANULADA', motivo || 'Venta anulada', idVenta]
      );

      // Opcional: Restaurar stock (descomenta si quieres que se restaure automáticamente)
      // const detallesResultado = await cliente.query(
      //   'SELECT id_producto, cantidad FROM venta_detalle WHERE id_venta = $1',
      //   [idVenta]
      // );

      // for (const detalle of detallesResultado.rows) {
      //   await cliente.query(
      //     `INSERT INTO inventario_movimiento (producto_id, tipo, cantidad, signo, referencia, venta_id, observacion)
      //      VALUES ($1, $2, $3, $4, $5, $6)`,
      //     [detalle.id_producto, 'AJUSTE_ENTRADA', detalle.cantidad, 1, `Anulación Venta ${idVenta}`, idVenta, 'Reintegro por anulación']
      //   );
      // }

      await cliente.query('COMMIT');
      return resultado.rows[0];
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de ventas
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_ventas,
          COUNT(CASE WHEN estado = 'EMITIDA' THEN 1 END) as ventas_emitidas,
          COUNT(CASE WHEN estado = 'ANULADA' THEN 1 END) as ventas_anuladas,
          COUNT(CASE WHEN fecha >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as ventas_ultimo_mes,
          COUNT(CASE WHEN fecha >= CURRENT_DATE THEN 1 END) as ventas_hoy,
          COALESCE(SUM(CASE WHEN estado = 'EMITIDA' THEN total ELSE 0 END), 0) as total_ventas_monto,
          COALESCE(AVG(CASE WHEN estado = 'EMITIDA' THEN total ELSE NULL END), 0) as promedio_venta,
          COALESCE(SUM(CASE WHEN fecha >= CURRENT_DATE AND estado = 'EMITIDA' THEN total ELSE 0 END), 0) as ventas_hoy_monto
        FROM venta
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Obtener ventas por rango de fechas
  static async obtenerVentasPorRangoFechas(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT v.id_venta, v.fecha, v.total, v.estado, v.observacion,
                c.nombre as cliente_nombre, u.nombre as usuario_nombre
         FROM venta v
         LEFT JOIN cliente c ON v.cliente_id = c.id_cliente
         JOIN usuarios u ON v.usuario_id = u.id_usuario
         WHERE v.fecha >= $1 AND v.fecha <= $2
         ORDER BY v.fecha DESC`,
        [desde, hasta]
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Obtener productos más vendidos
  static async obtenerProductosMasVendidos(limite = 10, fechaDesde = null, fechaHasta = null) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT p.id_producto, p.nombre, p.sku, p.codigo_barras,
               SUM(vd.cantidad) as total_vendido,
               COUNT(DISTINCT v.id_venta) as veces_vendido,
               SUM(vd.subtotal) as total_ingresos,
               AVG(vd.precio_unitario) as precio_promedio
        FROM venta_detalle vd
        JOIN producto p ON vd.id_producto = p.id_producto
        JOIN venta v ON vd.id_venta = v.id_venta
        WHERE v.estado = 'EMITIDA'
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      if (fechaDesde) {
        consulta += ` AND v.fecha >= $${contadorParametros}`;
        parametros.push(fechaDesde);
        contadorParametros++;
      }
      
      if (fechaHasta) {
        consulta += ` AND v.fecha <= $${contadorParametros}`;
        parametros.push(fechaHasta);
        contadorParametros++;
      }
      
      consulta += `
        GROUP BY p.id_producto, p.nombre, p.sku, p.codigo_barras
        ORDER BY total_vendido DESC
        LIMIT $${contadorParametros}
      `;
      parametros.push(limite);
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // Verificar si una venta existe
  static async existe(idVenta) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM venta WHERE id_venta = $1',
        [idVenta]
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }
}

module.exports = VentaModel;
