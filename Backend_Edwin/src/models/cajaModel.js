const { pool } = require('../config/db');
const { crearError } = require('../utils/errorHandler');

class CajaModel {
  // Abrir caja
  static async abrirCaja(datosCaja) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      // Verificar que no hay otra caja abierta
      const cajaAbierta = await cliente.query(
        'SELECT id_caja FROM caja WHERE estado = $1',
        ['ABIERTO']
      );
      
      if (cajaAbierta.rows.length > 0) {
        throw crearError('Ya existe una caja abierta. Debe cerrar la caja actual antes de abrir una nueva', 400);
      }

      // Verificar que el usuario existe
      const usuarioExiste = await cliente.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [datosCaja.usuario_apertura]
      );
      
      if (usuarioExiste.rows.length === 0) {
        throw crearError('El usuario especificado no existe', 400);
      }

      // Crear la caja
      const resultado = await cliente.query(
        `INSERT INTO caja (usuario_apertura, saldo_inicial, estado, observacion)
         VALUES ($1, $2, $3, $4)
         RETURNING id_caja, fecha_apertura, usuario_apertura, saldo_inicial, estado, observacion, created_at, updated_at`,
        [
          datosCaja.usuario_apertura,
          datosCaja.saldo_inicial || 0.00,
          'ABIERTO',
          datosCaja.observacion || null
        ]
      );

      await cliente.query('COMMIT');
      return resultado.rows[0];
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Cerrar caja
  static async cerrarCaja(idCaja, datosCierre) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      // Verificar que la caja existe y está abierta
      const cajaExiste = await cliente.query(
        'SELECT * FROM caja WHERE id_caja = $1 AND estado = $2',
        [idCaja, 'ABIERTO']
      );
      
      if (cajaExiste.rows.length === 0) {
        throw crearError('La caja no existe o no está abierta', 404);
      }

      const caja = cajaExiste.rows[0];

      // Verificar que el usuario de cierre existe
      if (datosCierre.usuario_cierre) {
        const usuarioExiste = await cliente.query(
          'SELECT 1 FROM usuarios WHERE id_usuario = $1',
          [datosCierre.usuario_cierre]
        );
        
        if (usuarioExiste.rows.length === 0) {
          throw crearError('El usuario de cierre especificado no existe', 400);
        }
      }

      // Calcular el saldo de cierre basado en las ventas
      const ventasResultado = await cliente.query(
        'SELECT COALESCE(SUM(total), 0) as total_ventas FROM venta WHERE caja_id = $1 AND estado = $2',
        [idCaja, 'EMITIDA']
      );

      const totalVentas = parseFloat(ventasResultado.rows[0].total_ventas);
      const saldoInicial = parseFloat(caja.saldo_inicial);
      const saldoCierre = saldoInicial + totalVentas;

      // Cerrar la caja
      const resultado = await cliente.query(
        `UPDATE caja 
         SET estado = $1, fecha_cierre = $2, usuario_cierre = $3, saldo_cierre = $4, observacion = $5, updated_at = NOW()
         WHERE id_caja = $6
         RETURNING *`,
        [
          'CERRADO',
          new Date(),
          datosCierre.usuario_cierre || caja.usuario_apertura,
          saldoCierre,
          datosCierre.observacion || null,
          idCaja
        ]
      );

      await cliente.query('COMMIT');
      return resultado.rows[0];
    } catch (error) {
      await cliente.query('ROLLBACK');
      throw error;
    } finally {
      cliente.release();
    }
  }

  // Obtener caja abierta
  static async obtenerCajaAbierta() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT c.id_caja, c.fecha_apertura, c.usuario_apertura, c.saldo_inicial, c.estado, c.observacion, c.created_at, c.updated_at,
                u.nombre as usuario_nombre
         FROM caja c
         JOIN usuarios u ON c.usuario_apertura = u.id_usuario
         WHERE c.estado = $1
         ORDER BY c.fecha_apertura DESC
         LIMIT 1`,
        ['ABIERTO']
      );
      
      if (resultado.rows.length === 0) {
        return null;
      }

      const caja = resultado.rows[0];

      // Calcular estadísticas de la caja
      const ventasResultado = await cliente.query(
        `SELECT 
           COUNT(*) as total_ventas,
           COALESCE(SUM(total), 0) as total_ventas_monto,
           COALESCE(AVG(total), 0) as promedio_venta
         FROM venta 
         WHERE caja_id = $1 AND estado = $2`,
        [caja.id_caja, 'EMITIDA']
      );

      const estadisticas = ventasResultado.rows[0];
      caja.estadisticas = {
        total_ventas: parseInt(estadisticas.total_ventas),
        total_ventas_monto: parseFloat(estadisticas.total_ventas_monto),
        promedio_venta: parseFloat(estadisticas.promedio_venta),
        saldo_actual: caja.saldo_inicial + parseFloat(estadisticas.total_ventas_monto)
      };

      return caja;
    } finally {
      cliente.release();
    }
  }

  // Obtener cajas con paginación y filtros
  static async obtenerCajas(filtros = {}, paginacion = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT c.id_caja, c.fecha_apertura, c.usuario_apertura, c.saldo_inicial, c.estado, 
               c.fecha_cierre, c.usuario_cierre, c.saldo_cierre, c.observacion, c.created_at, c.updated_at,
               ua.nombre as usuario_apertura_nombre, uc.nombre as usuario_cierre_nombre
        FROM caja c
        JOIN usuarios ua ON c.usuario_apertura = ua.id_usuario
        LEFT JOIN usuarios uc ON c.usuario_cierre = uc.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.estado) {
        consulta += ` AND c.estado = $${contadorParametros}`;
        parametros.push(filtros.estado);
        contadorParametros++;
      }
      
      if (filtros.usuario_apertura) {
        consulta += ` AND c.usuario_apertura = $${contadorParametros}`;
        parametros.push(filtros.usuario_apertura);
        contadorParametros++;
      }
      
      if (filtros.fecha_desde) {
        consulta += ` AND c.fecha_apertura >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND c.fecha_apertura <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      // Contar total de registros
      // Construir consulta de conteo correctamente (el regex debe manejar múltiples líneas)
      const consultaCount = consulta.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const resultadoCount = await cliente.query(consultaCount, parametros);
      const total = parseInt(resultadoCount.rows[0]?.total || 0);
      
      // Aplicar paginación
      consulta += ` ORDER BY c.fecha_apertura DESC`;
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
        cajas: resultado.rows,
        total
      };
    } finally {
      cliente.release();
    }
  }

  // Obtener caja por ID
  static async obtenerPorId(idCaja) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT c.id_caja, c.fecha_apertura, c.usuario_apertura, c.saldo_inicial, c.estado, 
                c.fecha_cierre, c.usuario_cierre, c.saldo_cierre, c.observacion, c.created_at, c.updated_at,
                ua.nombre as usuario_apertura_nombre, uc.nombre as usuario_cierre_nombre
         FROM caja c
         JOIN usuarios ua ON c.usuario_apertura = ua.id_usuario
         LEFT JOIN usuarios uc ON c.usuario_cierre = uc.id_usuario
         WHERE c.id_caja = $1`,
        [idCaja]
      );
      
      if (resultado.rows.length === 0) {
        throw crearError('Caja no encontrada', 404);
      }

      const caja = resultado.rows[0];

      // Obtener ventas de la caja
      const ventasResultado = await cliente.query(
        `SELECT v.id_venta, v.fecha, v.total, v.estado, v.observacion,
                c.nombre as cliente_nombre, u.nombre as usuario_nombre
         FROM venta v
         LEFT JOIN cliente c ON v.cliente_id = c.id_cliente
         JOIN usuarios u ON v.usuario_id = u.id_usuario
         WHERE v.caja_id = $1
         ORDER BY v.fecha DESC`,
        [idCaja]
      );

      caja.ventas = ventasResultado.rows;

      return caja;
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas de caja
  static async obtenerEstadisticas() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(`
        SELECT 
          COUNT(*) as total_cajas,
          COUNT(CASE WHEN estado = 'ABIERTO' THEN 1 END) as cajas_abiertas,
          COUNT(CASE WHEN estado = 'CERRADO' THEN 1 END) as cajas_cerradas,
          COUNT(CASE WHEN fecha_apertura >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as cajas_ultimo_mes,
          COALESCE(SUM(saldo_cierre - saldo_inicial), 0) as total_ingresos,
          COALESCE(AVG(saldo_cierre - saldo_inicial), 0) as promedio_ingresos_por_caja
        FROM caja
      `);
      
      return resultado.rows[0];
    } finally {
      cliente.release();
    }
  }

  // Verificar si hay caja abierta
  static async hayCajaAbierta() {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        'SELECT 1 FROM caja WHERE estado = $1 LIMIT 1',
        ['ABIERTO']
      );
      
      return resultado.rows.length > 0;
    } finally {
      cliente.release();
    }
  }

  // Obtener resumen de caja por día
  static async obtenerResumenPorDia(fecha) {
    const cliente = await pool.connect();
    try {
      const resultado = await cliente.query(
        `SELECT 
           DATE(v.fecha) as fecha,
           COUNT(v.id_venta) as total_ventas,
           COALESCE(SUM(v.total), 0) as total_ventas_monto,
           COALESCE(AVG(v.total), 0) as promedio_venta,
           COALESCE(SUM(v.total), 0) as total_ingresos
         FROM venta v
         WHERE DATE(v.fecha) = $1 AND v.estado = 'EMITIDA'
         GROUP BY DATE(v.fecha)
         ORDER BY DATE(v.fecha)`,
        [fecha]
      );
      
      return resultado.rows;
    } finally {
      cliente.release();
    }
  }

  // ========================================
  // MÉTODOS PARA REPORTES
  // ========================================

  // Obtener histórico de cajas
  static async obtenerHistorico(filtros = {}) {
    const cliente = await pool.connect();
    try {
      let consulta = `
        SELECT 
          c.id_caja,
          c.fecha_apertura,
          c.fecha_cierre,
          c.saldo_inicial,
          c.saldo_cierre,
          c.estado,
          c.observacion,
          CONCAT(ua.nombre, ' ', ua.apellido) as usuario_apertura_nombre,
          CONCAT(uc.nombre, ' ', uc.apellido) as usuario_cierre_nombre,
          (c.saldo_cierre - c.saldo_inicial) as diferencia
        FROM caja c
        LEFT JOIN usuarios ua ON c.usuario_apertura = ua.id_usuario
        LEFT JOIN usuarios uc ON c.usuario_cierre = uc.id_usuario
        WHERE 1=1
      `;
      
      const parametros = [];
      let contadorParametros = 1;
      
      // Aplicar filtros
      if (filtros.fecha_desde) {
        consulta += ` AND c.fecha_apertura >= $${contadorParametros}`;
        parametros.push(filtros.fecha_desde);
        contadorParametros++;
      }
      
      if (filtros.fecha_hasta) {
        consulta += ` AND c.fecha_apertura <= $${contadorParametros}`;
        parametros.push(filtros.fecha_hasta);
        contadorParametros++;
      }
      
      if (filtros.estado) {
        consulta += ` AND c.estado = $${contadorParametros}`;
        parametros.push(filtros.estado);
        contadorParametros++;
      }
      
      consulta += ` ORDER BY c.fecha_apertura DESC`;
      
      const resultado = await cliente.query(consulta, parametros);
      return resultado.rows;
      
    } finally {
      cliente.release();
    }
  }

  // Obtener estadísticas para dashboard
  static async obtenerEstadisticasDashboard(desde, hasta) {
    const cliente = await pool.connect();
    try {
      const consulta = `
        SELECT 
          COUNT(c.id_caja) as total_cajas,
          COUNT(CASE WHEN c.estado = 'ABIERTO' THEN 1 END) as cajas_abiertas,
          COUNT(CASE WHEN c.estado = 'CERRADO' THEN 1 END) as cajas_cerradas,
          COALESCE(SUM(c.saldo_inicial), 0) as total_saldo_inicial,
          COALESCE(SUM(c.saldo_cierre), 0) as total_saldo_cierre,
          COALESCE(SUM(c.saldo_cierre - c.saldo_inicial), 0) as total_diferencia
        FROM caja c
        WHERE c.fecha_apertura >= $1 
          AND c.fecha_apertura <= $2
      `;
      
      const resultado = await cliente.query(consulta, [desde, hasta]);
      return resultado.rows[0] || {
        total_cajas: 0,
        cajas_abiertas: 0,
        cajas_cerradas: 0,
        total_saldo_inicial: 0,
        total_saldo_cierre: 0,
        total_diferencia: 0
      };
      
    } finally {
      cliente.release();
    }
  }
}

module.exports = CajaModel;
